<template>
  <div class="browse-history-tab">
    <div class="tab-header">
      <h2 class="tab-title">{{ t('user.browseHistory') }}</h2>
      <!-- 搜索框：后端暂无 keyword，当前为已加载页客户端过滤；后端补充后改为服务端搜索 + 重置分页 -->
      <NInput
        v-model:value="searchKey"
        :placeholder="t('common.searchPosts')"
        clearable
        style="width: 280px;">
        <template #prefix>
          <NIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </NIcon>
        </template>
      </NInput>
    </div>

    <NSpin :show="loading && !posts.length">
      <div class="posts-list" :class="{ 'posts-list--loading': loading && !posts.length }">
        <div v-if="!loading && filteredPosts.length === 0" class="empty-state">
          <NIcon size="64" :depth="3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </NIcon>
          <p class="empty-text">{{ t('common.noData') }}</p>
        </div>
        <div v-else class="post-cards">
          <NCard
            v-for="post in filteredPosts"
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
            </div>
            <div class="post-title-row">
              <h3 class="post-title">{{ post.title }}</h3>
              <div v-if="post.isPinned || post.isEssence" class="post-badges">
                <NTag v-if="post.isPinned" size="tiny" round type="warning">{{ t('post.badges.pinned') }}</NTag>
                <NTag v-if="post.isEssence" size="tiny" round type="success">{{ t('post.badges.essence') }}</NTag>
              </div>
            </div>
            <p class="post-content">{{ post.content }}</p>
            <!-- 图片轮播：与帖子列表/收藏卡片统一使用 ImageCarousel -->
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
                <span class="stat">
                  <NIcon>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </NIcon>
                  {{ formatNumber(post.collects) }}
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NAvatar, NIcon, NTag, NInput, NSpin, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { getHistoryPosts } from '@/api/history'
import { useFormatTime, useFormatNumber } from '@/utils/i18n'
import ImageCarousel from '@/components/post-detail/ImageCarousel.vue'

const props = defineProps({
  // 当前 tab 是否激活；切回 history tab 时重置并重新拉取首页
  // （详情页会 bump 帖子到顶，切回刷新即可看到顺序变化）
  active: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['total-change'])

const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const { formatTime } = useFormatTime()
const { formatNumber } = useFormatNumber()

const searchKey = ref('')
const loading = ref(false)

// 列表与分页状态（/history/posts 采用 offset 分页，非游标）
const PAGE_SIZE = 10
const posts = ref([])
const offset = ref(0) // 下一页偏移量；首页为 0
const hasMore = ref(false)
const sentinel = ref(null)
let observer = null

// 后端 snake_case → 组件 camelCase（结构同帖子列表/收藏接口）
const transformPost = (p) => ({
  id: p.id,
  title: p.title || t('post.title'),
  content: p.summary || p.content || '',
  authorName: p.author_name || '',
  authorAvatar: p.author_avatar || '',
  circleName: p.circle_name || '',
  images: p.images || [],
  isPinned: p.is_pinned,
  isEssence: p.is_essence,
  timeText: formatTime(p.create_time || ''),
  comments: p.comment_count || 0,
  likes: p.like_count || 0,
  views: p.view_count || 0,
  collects: p.collect_count || 0
})

// 拉取浏览历史：append=true 表示追加下一页
const fetchPosts = async (append = false) => {
  if (loading.value) return
  loading.value = true
  try {
    const params = { size: PAGE_SIZE }
    if (append && offset.value) {
      params.offset = offset.value
    }

    const res = await getHistoryPosts(params)
    const data = res.data || {}
    const list = (data.posts || []).map(transformPost)
    posts.value = append ? [...posts.value, ...list] : list

    // next_offset 字段省略 = 已到末页（与 collect 的 search_after 空串判据不同）
    if (data.next_offset !== undefined && data.next_offset !== null) {
      offset.value = data.next_offset
      hasMore.value = true
    } else {
      hasMore.value = false
    }

    // 仅首页（含重新拉取）上报命中总数，供父组件展示 Tab 计数
    if (!append) {
      emit('total-change', data.total || 0)
    }
  } catch (error) {
    console.error('获取浏览历史失败:', error)
    message.error(error.message || t('common.operationFailed'))
  } finally {
    loading.value = false
  }
}

// 关键字过滤（当前仅过滤已加载页；后端补 keyword 后改为服务端搜索 + 重置分页）
const filteredPosts = computed(() => {
  if (!searchKey.value) return posts.value
  const key = searchKey.value.toLowerCase()
  return posts.value.filter(p =>
    (p.title || '').toLowerCase().includes(key) ||
    (p.content || '').toLowerCase().includes(key) ||
    (p.authorName || '').toLowerCase().includes(key)
  )
})

// 重置列表并从首页重新拉取（切回本 tab 时使用，刷新 bump 后的顺序）
const resetAndFetch = () => {
  offset.value = 0
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

// 切回本 tab 时重新拉取（active 由父组件传入：activeTab === 'history'）
watch(() => props.active, (v) => {
  if (v) resetAndFetch()
})

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
.browse-history-tab {
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

/* 图片轮播：与帖子列表卡片保持一致 */
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

/* 响应式 */
@media (max-width: 768px) {
  .tab-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
