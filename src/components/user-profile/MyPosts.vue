<template>
  <div class="my-posts-tab">
    <div class="tab-header">
      <h2 class="tab-title">{{ readonly ? t('user.posts') : t('user.myPosts') }}</h2>
      <NInput
        v-model:value="searchKey"
        :placeholder="t('common.searchPosts')"
        clearable
        style="width: 280px;"
        @keyup.enter="handleSearch"
        @clear="handleSearchClear">
        <template #prefix>
          <NIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </NIcon>
        </template>
      </NInput>
      <NButton @click="handleSearch">
        <template #icon>
          <NIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </NIcon>
        </template>
        {{ t('common.search') }}
      </NButton>
    </div>

    <NSpin :show="loading && !posts.length">
      <div class="posts-list" :class="{ 'posts-list--loading': loading && !posts.length }">
        <div v-if="!loading && posts.length === 0" class="empty-state">
          <NIcon size="64" :depth="3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
            </svg>
          </NIcon>
          <p class="empty-text">{{ t('post.noPosts') }}</p>
          <p v-if="!readonly" class="empty-hint">{{ t('post.createPost') }}</p>
        </div>
        <div v-else class="post-cards">
          <NCard
            v-for="post in posts"
            :key="post.id"
            class="post-card"
            :bordered="false"
            hoverable
            @click="handleCardClick(post)">
            <div class="post-header">
              <div class="post-author">
                <NAvatar
                  :size="40"
                  :src="post.authorAvatar"
                  round/>
                <div class="author-info">
                  <span class="author-name">{{ post.authorName }}</span>
                  <span class="post-time">{{ post.timeText }}</span>
                </div>
              </div>
              <div class="header-right">
                <NTag
                  v-if="post.status !== undefined && post.status !== 1"
                  size="tiny"
                  round
                  :type="statusType(post.status)">
                  {{ statusText(post.status) }}
                </NTag>
                <NDropdown v-if="!readonly" :options="getPostMenuOptions()" @select="(key) => handleAction(key, post)">
                  <NButton quaternary circle size="small">
                    <template #icon>
                      <NIcon>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="19" cy="12" r="1"></circle>
                          <circle cx="5" cy="12" r="1"></circle>
                        </svg>
                      </NIcon>
                    </template>
                  </NButton>
                </NDropdown>
              </div>
            </div>
            <div class="post-title-row">
              <h3 class="post-title">{{ post.title }}</h3>
              <div v-if="post.isPinned || post.isEssence" class="post-badges">
                <NTag v-if="post.isPinned" size="tiny" round type="warning">{{ t('post.badges.pinned') }}</NTag>
                <NTag v-if="post.isEssence" size="tiny" round type="success">{{ t('post.badges.essence') }}</NTag>
              </div>
            </div>
            <p class="post-content">{{ post.content }}</p>
            <!-- 图片轮播：与搜索结果帖子卡片统一使用 ImageCarousel -->
            <div v-if="post.images && post.images.length" class="post-carousel" @click.stop>
              <ImageCarousel :images="post.images" :parent-width="900" />
            </div>
            <div class="post-footer">
              <div class="post-tags">
                <span v-if="post.circleName" class="circle-tag">{{ post.circleName }}</span>
              </div>
              <div class="post-stats">
                <span class="stat">
                  <NIcon>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </NIcon>
                  {{ formatNumber(post.comments) }}
                </span>
                <span class="stat">
                  <NIcon>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </NIcon>
                  {{ formatNumber(post.likes) }}
                </span>
                <span class="stat">
                  <NIcon>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </NIcon>
                  {{ formatNumber(post.views) }}
                </span>
              </div>
            </div>
          </NCard>
        </div>

        <!-- 无限滚动哨兵 -->
        <div ref="sentinel" class="scroll-sentinel"></div>
        <div v-if="posts.length" class="list-footer">
          <span v-if="loading" class="footer-text">{{ t('common.loading') }}</span>
          <span v-else-if="!hasMore" class="footer-text">{{ t('common.noMore') }}</span>
        </div>
      </div>
    </NSpin>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NAvatar, NIcon, NTag, NInput, NButton, NSpin, NDropdown, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { getMyPosts, getUserPosts } from '@/api/post'
import { useFormatTime, useFormatNumber } from '@/utils/i18n'
import ImageCarousel from '@/components/post-detail/ImageCarousel.vue'

const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const { formatTime } = useFormatTime()
const { formatNumber } = useFormatNumber()

const props = defineProps({
  // 目标用户 ID：
  // - 为空：查看「我的帖子」，走 /post/my（可见全部状态，含草稿/审核/拒绝/封禁）
  // - 传值：查看该用户的帖子，走 /post/user/:userId（仅返回已发布 status=1）
  userId: {
    type: String,
    default: ''
  },
  // 只读模式：隐藏编辑/删除等管理操作（查看他人主页时为 true）
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'total-change'])

const searchKey = ref('')
const loading = ref(false)

// 列表与分页状态（两种接口共用，响应结构一致）
const PAGE_SIZE = 10
const posts = ref([])
const searchAfter = ref('') // 游标原样字符串，首页为空串；原样透传给下一页
const hasMore = ref(false)
const sentinel = ref(null)
let observer = null

// 后端 snake_case → 组件 camelCase
const transformPost = (p) => ({
  id: p.id,
  title: p.title || t('post.title'),
  content: p.summary || p.content || '',
  authorName: p.author_name || '',
  authorAvatar: p.author_avatar || '',
  circleName: p.circle_name || '',
  images: p.images || [],
  status: p.status,
  isPinned: p.is_pinned,
  isEssence: p.is_essence,
  timeText: formatTime(p.create_time || ''),
  comments: p.comment_count || 0,
  likes: p.like_count || 0,
  views: p.view_count || 0,
  collects: p.collect_count || 0
})

// 拉取帖子：append=true 表示追加下一页
// 数据源由 userId 决定 —— /post/my（我的）或 /post/user/:userId（他人）
const fetchPosts = async (append = false) => {
  if (loading.value) return
  loading.value = true
  try {
    const params = { size: PAGE_SIZE }
    if (searchKey.value) params.keyword = searchKey.value
    if (append && searchAfter.value) {
      // 游标原样透传，不解析/不重新序列化（axios 会自动 URL-encode）
      params.search_after = searchAfter.value
    }

    const res = props.userId
      ? await getUserPosts(props.userId, params)
      : await getMyPosts(params)

    const data = res.data || {}
    const list = (data.posts || []).map(transformPost)
    posts.value = append ? [...posts.value, ...list] : list

    // search_after 为空字符串表示已到末页；否则原样保存供下一页透传
    searchAfter.value = data.search_after || ''
    hasMore.value = !!data.search_after

    // 仅首页（含新搜索）上报命中总数，供父组件展示 Tab 计数
    if (!append) {
      emit('total-change', data.total || 0)
    }
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    message.error(error.message || t('common.operationFailed'))
  } finally {
    loading.value = false
  }
}

// 关键字搜索（按钮 / 回车主动触发，服务端匹配）
const handleSearch = () => {
  searchAfter.value = ''
  hasMore.value = false
  fetchPosts(false)
}

const handleSearchClear = () => {
  searchAfter.value = ''
  hasMore.value = false
  fetchPosts(false)
}

// 重置列表并从首页重新拉取（切换目标用户 / 重新搜索时使用）
const resetAndFetch = () => {
  searchAfter.value = ''
  hasMore.value = false
  posts.value = []
  fetchPosts(false)
}

// 无限滚动：sentinel 进入视口时加载下一页
const setupObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (!sentinel.value || !hasMore.value || loading.value) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value && !loading.value) {
        fetchPosts(true)
      }
    },
    { rootMargin: '200px' } // 提前 200px 触发，体验更顺滑
  )
  observer.observe(sentinel.value)
}

watch([sentinel, hasMore, loading], setupObserver)

// 切换目标用户（路由参数变化）时重置并重新拉取首页
watch(() => props.userId, (next, prev) => {
  if (next !== prev) resetAndFetch()
})

// 状态文案 / 标签颜色
const statusText = (status) => {
  const map = {
    0: 'post.status.draft',
    1: 'post.status.normal',
    2: 'post.status.reviewing',
    3: 'post.status.rejected',
    4: 'post.status.blocked'
  }
  return t(map[status] || 'post.status.normal')
}

const statusType = (status) => ({
  0: 'default',
  1: 'success',
  2: 'info',
  3: 'warning',
  4: 'error'
}[status] || 'default')

const getPostMenuOptions = () => {
  return [
    { label: t('common.edit'), key: 'edit' },
    { label: t('common.delete'), key: 'delete' }
  ]
}

const handleAction = (key, post) => {
  switch (key) {
    case 'edit':
      message.info(`${t('common.edit')}: ${post.title}`)
      emit('edit', post)
      break
    case 'delete':
      message.warning(`${t('common.delete')}: ${post.title}`)
      emit('delete', post)
      break
  }
}

const handleCardClick = (post) => {
  router.push(`/post/${post.id}`)
}

onMounted(() => {
  fetchPosts(false)
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.my-posts-tab {
  padding: 8px 0;
}

.tab-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.tab-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-right: 3dvw;
  color: rgba(255, 255, 255, 0.95);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 加载占位：列表为空时撑高容器，避免 NSpin 动画被裁剪、页面收缩跳动 */
.posts-list--loading {
  min-height: 320px;
}

.post-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  transition: all 0.3s ease;
  cursor: pointer;
}

.post-card:hover {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.post-time {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 8px 0;
}

.post-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.post-badges {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.post-content {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 图片轮播：与搜索结果帖子卡片保持一致 */
.post-carousel {
  margin-bottom: 12px;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.post-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.circle-tag {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 10px;
  border-radius: 10px;
}

.post-stats {
  display: flex;
  gap: 16px;
}

.post-stats .stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

.scroll-sentinel {
  height: 1px;
  width: 100%;
}

.list-footer {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.footer-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 16px 0 4px 0;
}

.empty-hint {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .tab-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
