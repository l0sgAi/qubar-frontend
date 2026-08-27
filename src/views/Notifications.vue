<template>
  <div class="notifications-page">
    <!-- 顶栏 -->
    <AppHeader />

    <!-- 侧边栏 -->
    <SideNav @collapsed="offset = 64" @expanded="offset = 260" />

    <!-- 主内容区域 -->
    <div class="content-wrapper" :style="{ 'margin-left': `${offset}px`, width: `calc(100% - ${offset}px)` }">
      <div class="main-content">
        <div class="notice-container">
          <!-- 页头 -->
          <div class="notice-header">
            <h1 class="page-title">{{ t('notice.title') }}</h1>
            <NButton
              v-if="notices.length"
              quaternary
              size="small"
              class="read-all-btn"
              :loading="readingAll"
              @click="handleReadAll"
            >
              {{ t('notice.readAll') }}
            </NButton>
          </div>

          <!-- 类型过滤 Tab -->
          <div class="notice-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.type"
              class="notice-tab"
              :class="{ active: activeType === tab.type }"
              @click="switchTab(tab.type)"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- 通知列表 -->
          <div class="notice-list">
            <div
              v-for="item in notices"
              :key="item.id"
              class="notice-item"
              :class="{ unread: !item.is_read }"
              @click="handleClickNotice(item)"
            >
              <NAvatar
                round
                :size="40"
                :src="item.actor?.avatar_url || undefined"
                class="notice-avatar"
              >
                {{ (item.actor?.username || t('notice.someone')).charAt(0).toUpperCase() }}
              </NAvatar>
              <div class="notice-body">
                <div class="notice-text">{{ renderText(item) }}</div>
                <div class="notice-time">{{ formatTime(item.create_time) }}</div>
              </div>
              <span v-if="!item.is_read" class="unread-dot"></span>
            </div>

            <!-- 空态 -->
            <NEmpty v-if="!loading && !notices.length" :description="t('notice.empty')" class="notice-empty" />

            <!-- 加载中 -->
            <div v-if="loading" class="notice-loading">
              <NSpin size="small" />
            </div>

            <!-- 无限滚动触发器 / 到底提示 -->
            <div v-if="hasMore" ref="loadMoreTrigger" class="load-more-trigger"></div>
            <div v-else-if="notices.length" class="no-more">{{ t('notice.noMore') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { NAvatar, NButton, NEmpty, NSpin, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import SideNav from '@/components/SideNav.vue'
import { getNoticeList, markNoticesRead, markAllNoticesRead } from '@/api/notice'
import { useFormatTime } from '@/utils/i18n'

const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const { formatTime } = useFormatTime()

const offset = ref(260)

// 类型过滤 Tab：type 对应后端 notice_type，0=全部
// 注：帖子被赞(1)与评论被赞(2)同属「点赞」，接口仅支持单值过滤，故「点赞」tab 传 1，2 在「全部」中可见
const tabs = computed(() => [
  { type: 0, label: t('notice.tabs.all') },
  { type: 1, label: t('notice.tabs.like') },
  { type: 3, label: t('notice.tabs.collect') },
  { type: 4, label: t('notice.tabs.comment') },
  { type: 5, label: t('notice.tabs.reply') },
  { type: 6, label: t('notice.tabs.mention') }
])
const activeType = ref(0)

const notices = ref([])
const loading = ref(false)
const cursor = ref('')
const hasMore = ref(true)
const readingAll = ref(false)

// 文案模板按类型渲染；actor 缺省（用户注销等降级场景）兜底为「有人」
const TEMPLATE_KEYS = {
  1: 'likePost',
  2: 'likeComment',
  3: 'collectPost',
  4: 'commentPost',
  5: 'replyComment',
  6: 'mention'
}

const renderText = (item) => {
  const key = TEMPLATE_KEYS[item.notice_type]
  const actor = item.actor?.username || t('notice.someone')
  if (!key) return item.snippet || ''
  return t(`notice.templates.${key}`, { actor, snippet: item.snippet || '' })
}

// 加载通知列表（keyset 游标分页，只顺序向后翻）
const loadNotices = async (isRefresh = false) => {
  if (loading.value) return
  if (!isRefresh && !hasMore.value) return

  loading.value = true
  try {
    const params = { type: activeType.value, size: 20 }
    if (!isRefresh && cursor.value) {
      params.cursor = cursor.value
    }

    const res = await getNoticeList(params)
    if (res.data) {
      const items = res.data.notices || []
      notices.value = isRefresh ? items : [...notices.value, ...items]
      // 空字符串游标 = 没有更多
      cursor.value = res.data.cursor || ''
      hasMore.value = cursor.value !== ''
    }
  } catch (error) {
    console.error('加载通知失败:', error)
    message.error(t('notice.loadFailed'))
  } finally {
    loading.value = false
    if (hasMore.value) {
      await nextTick()
      setupObserver()
    }
  }
}

// 切换类型过滤：重置游标重新拉
const switchTab = (type) => {
  if (type === activeType.value) return
  activeType.value = type
  notices.value = []
  cursor.value = ''
  hasMore.value = true
  cleanupObserver()
  loadNotices(true)
}

// 点击通知：未读则顺手标读，再跳帖子详情（有 comment_id 带上定位参数）
const handleClickNotice = async (item) => {
  if (!item.is_read) {
    item.is_read = true
    try {
      await markNoticesRead([item.id])
      // 通知顶栏角标本地校正
      window.dispatchEvent(new CustomEvent('notice-read', { detail: { count: 1 } }))
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  if (!item.post_id) return
  router.push({
    path: `/post/${item.post_id}`,
    query: item.comment_id ? { comment_id: item.comment_id } : {}
  }).catch(() => {
    // 目标帖子可能已删除（404），提示后停留当前页
    message.warning(t('notice.targetDeleted'))
  })
}

// 全部已读：本地清零角标 + 列表样式
const handleReadAll = async () => {
  if (readingAll.value) return
  readingAll.value = true
  try {
    await markAllNoticesRead()
    notices.value.forEach(n => { n.is_read = true })
    window.dispatchEvent(new CustomEvent('notice-read-all'))
    message.success(t('notice.readAllSuccess'))
  } catch (error) {
    console.error('全部已读失败:', error)
    message.error(t('notice.readAllFailed'))
  } finally {
    readingAll.value = false
  }
}

// 无限滚动
const loadMoreTrigger = ref(null)
let observer = null

const setupObserver = () => {
  if (!loadMoreTrigger.value) return
  cleanupObserver()
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMore.value && !loading.value) {
          loadNotices()
        }
      })
    },
    { rootMargin: '100px', threshold: 0.1 }
  )
  observer.observe(loadMoreTrigger.value)
}

const cleanupObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

onMounted(() => {
  loadNotices(true)
})

onUnmounted(() => {
  cleanupObserver()
})
</script>

<style scoped>
.notifications-page {
  min-height: 100vh;
}

.content-wrapper {
  padding-top: var(--header-height);
  transition: margin-left 0.3s ease, width 0.3s ease;
}

.main-content {
  display: flex;
  justify-content: center;
  padding: 24px;
}

.notice-container {
  width: 100%;
  max-width: 720px;
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  padding: 20px 24px;
}

.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.read-all-btn {
  color: var(--text-secondary);
  border-radius: 16px;
  transition: all 0.2s ease;
}

.read-all-btn:hover {
  color: #8af0d0;
  background: rgba(102, 234, 194, 0.14);
}

/* 类型过滤 Tab：药丸式，激活态主题绿 */
.notice-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.notice-tab {
  padding: 6px 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notice-tab:hover {
  background: rgba(102, 234, 194, 0.08);
  color: var(--text-primary);
}

.notice-tab.active {
  background: rgba(102, 234, 194, 0.14);
  border-color: rgba(102, 234, 194, 0.4);
  color: #8af0d0;
}

/* 通知条目：内层圆角比容器小一档 */
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.notice-item:hover {
  background: rgba(102, 234, 194, 0.08);
}

/* 未读高亮 */
.notice-item.unread {
  background: rgba(102, 234, 194, 0.06);
}

.notice-item.unread:hover {
  background: rgba(102, 234, 194, 0.12);
}

.notice-avatar {
  flex-shrink: 0;
}

.notice-body {
  flex: 1;
  min-width: 0;
}

.notice-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  word-break: break-word;
}

.notice-item.unread .notice-text {
  font-weight: 500;
}

.notice-time {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.unread-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 8px;
  border-radius: 50%;
  background: var(--theme-color);
}

.notice-empty {
  padding: 48px 0;
}

.notice-loading {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.load-more-trigger {
  height: 1px;
}

.no-more {
  padding: 16px 0;
  text-align: center;
  font-size: 12px;
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }
}
</style>
