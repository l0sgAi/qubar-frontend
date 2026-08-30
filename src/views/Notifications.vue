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

          <!-- 类型过滤：顶栏 Tab -->
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

          <!-- 通知列表：整条为真实链接，右键/中键可新标签页打开 -->
          <div class="notice-list">
            <SmartLink
              v-for="item in notices"
              :key="item.id"
              class="notice-item"
              :class="{ unread: !item.is_read }"
              :to="noticeTarget(item)"
              @click="markReadAndBump(item)"
            >
              <NAvatar
                round
                :size="40"
                :src="item.actor?.avatar_url || undefined"
                class="notice-avatar"
              >
                <!-- NAvatar 的 default slot 优先级高于 src：兜底字母必须 v-if，
                     否则图片永远不会渲染（对齐 CommentList 写法） -->
                <div v-if="!item.actor?.avatar_url">{{ (item.actor?.username || t('notice.someone')).charAt(0).toUpperCase() }}</div>
              </NAvatar>
              <div class="notice-body">
                <div class="notice-text">{{ renderText(item) }}</div>
                <div class="notice-time">{{ formatTime(item.create_time) }}</div>
              </div>
              <span v-if="!item.is_read" class="unread-dot"></span>
            </SmartLink>

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
import { NAvatar, NButton, NEmpty, NSpin, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import SideNav from '@/components/SideNav.vue'
import SmartLink from '@/components/SmartLink.vue'
import { getNoticeList, markNoticesRead, markAllNoticesRead } from '@/api/notice'
import { useFormatTime } from '@/utils/i18n'

const message = useMessage()
const { t } = useI18n()
const { formatTime } = useFormatTime()

const offset = ref(260)

// 类型过滤 Tab：type 对应后端 notice_type，空/0=全部
// 接口支持逗号分隔多值过滤（notice_type IN (...)），帖子被赞(1)与评论被赞(2)同属「点赞」tab
const tabs = computed(() => [
  { type: 0, label: t('notice.tabs.all') },
  { type: '1,2', label: t('notice.tabs.like') },
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

// 加载世代：切换过滤类型后旧请求的响应直接丢弃，不得覆盖新列表/游标
let loadGen = 0

// 加载通知列表（keyset 游标分页，只顺序向后翻）
const loadNotices = async (isRefresh = false) => {
  if (!isRefresh && (loading.value || !hasMore.value)) return

  const gen = ++loadGen
  loading.value = true
  let succeeded = false
  try {
    const params = { type: activeType.value, size: 20 }
    if (!isRefresh && cursor.value) {
      params.cursor = cursor.value
    }

    const res = await getNoticeList(params)
    if (gen !== loadGen) return // 已切换过滤类型，过期响应丢弃
    if (res.data) {
      const items = res.data.notices || []
      notices.value = isRefresh ? items : [...notices.value, ...items]
      // 空字符串游标 = 没有更多
      cursor.value = res.data.cursor || ''
      hasMore.value = cursor.value !== ''
      succeeded = true
    }
  } catch (error) {
    if (gen !== loadGen) return
    console.error('加载通知失败:', error)
    message.error(t('notice.loadFailed'))
  } finally {
    // 过期请求的收尾不得动当前世代的 loading/observer
    if (gen === loadGen) {
      loading.value = false
      // 仅成功后才挂观察器：失败时触发器常驻视口会造成无限自动重试
      if (succeeded && hasMore.value) {
        await nextTick()
        setupObserver()
      }
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

// 通知跳转目标：帖子详情（有 comment_id 带上定位参数）；无 post_id 时降级为普通块
const noticeTarget = (item) => {
  if (!item.post_id) return null
  return {
    path: `/post/${item.post_id}`,
    query: item.comment_id ? { comment_id: item.comment_id } : {}
  }
}

// 点击通知顺手标记已读并校正顶栏角标（跳转由 SmartLink 承担）
const markReadAndBump = async (item) => {
  if (item.is_read) return
  item.is_read = true
  try {
    await markNoticesRead([item.id])
    window.dispatchEvent(new CustomEvent('notice-read', { detail: { count: 1 } }))
  } catch (error) {
    console.error('标记已读失败:', error)
  }
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
  margin-bottom: 8px;
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

/* 类型过滤：顶栏 Tab，全宽下划线式，滚动吸顶 */
.notice-tabs {
  position: sticky;
  top: var(--header-height);
  z-index: 10;
  display: flex;
  gap: 28px;
  margin: 0 -24px 8px;
  padding: 0 24px;
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  overflow-x: auto;
  scrollbar-width: none;
}

.notice-tabs::-webkit-scrollbar {
  display: none;
}

.notice-tab {
  position: relative;
  flex-shrink: 0;
  padding: 12px 2px;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.notice-tab:hover {
  color: var(--text-primary);
}

.notice-tab.active {
  color: #8af0d0;
  font-weight: 600;
}

/* 激活指示条 */
.notice-tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -1px;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  border-radius: 2px;
  background: var(--theme-color);
}

/* 通知列表容器（内层圆角比容器小一档） */
.notice-list {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 通知条目：整条为链接（SmartLink 渲染 <a>），重置链接默认外观（内层圆角比容器小一档） */
.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: none;
  border-radius: 10px;
  background: none;
  font: inherit;
  text-align: left;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: background 0.2s ease;
}

.notice-item:hover {
  background: rgba(102, 234, 194, 0.08);
}

/* 键盘焦点可见指示：Tab 聚焦时清晰可辨，Enter/Space 触发点击 */
.notice-item:focus-visible {
  outline: 2px solid var(--theme-color);
  outline-offset: -2px;
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
