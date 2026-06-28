<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <div class="right-sidebar">
      <div class="sidebar-content">
        <!-- 标题区域 -->
        <div class="sidebar-header">
          <h3 class="sidebar-title">
            <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {{ t('post.recent.title') }}
          </h3>
          <p class="sidebar-subtitle">{{ t('post.recent.subtitle') }}</p>
        </div>

        <!-- 帖子列表 -->
        <div class="recent-posts-list">
          <RecentPostCard
            v-for="post in recentPosts"
            :key="post.postId"
            :post-id="post.postId"
            :circle-name="post.circleName"
            :title="post.title"
            :content="post.content"
            :images="post.images"
            :post-time="post.postTime"
            :like-count="post.likeCount"
            :comment-count="post.commentCount"
          />
        </div>

        <!-- 加载中（首屏） -->
        <div v-if="loading" class="load-more">
          <NButton text disabled>
            {{ t('common.loading') }}
          </NButton>
        </div>

        <!-- 加载更多（search_after 游标翻页） -->
        <div v-else-if="hasMore" class="load-more">
          <NButton text :disabled="loadingMore" @click="handleLoadMore">
            <template #icon>
              <NIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </NIcon>
            </template>
            {{ loadingMore ? t('common.loading') : t('post.recent.loadMore') }}
          </NButton>
        </div>

        <!-- 空状态 -->
        <div v-if="recentPosts.length === 0 && !loading" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p class="empty-text">{{ t('post.recent.empty') }}</p>
        </div>
      </div>
    </div>
  </n-config-provider>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { NConfigProvider, NButton, NIcon, darkTheme, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import RecentPostCard from './RecentPostCard.vue'
import { getHomeFeed } from '@/api/post'

const message = useMessage()
const { t } = useI18n()

// NaiveUI 深色主题覆盖
const themeOverrides = {
  common: {
    primaryColor: '#ec4899',
    primaryColorHover: '#f472b6',
    primaryColorPressed: '#db2777',
    textColor1: 'rgba(255, 255, 255, 0.95)',
    textColor2: 'rgba(255, 255, 255, 0.8)',
    textColor3: 'rgba(255, 255, 255, 0.6)',
    textColor4: 'rgba(255, 255, 255, 0.4)'
  },
  Button: {
    color: 'rgba(255, 255, 255, 0.05)',
    colorHover: 'rgba(255, 255, 255, 0.1)',
    colorPressed: 'rgba(255, 255, 255, 0.15)',
    textColor: 'rgba(255, 255, 255, 0.8)',
    textColorHover: 'rgba(255, 255, 255, 0.95)',
    textColorPressed: 'rgba(255, 255, 255, 1)'
  }
}

const PAGE_SIZE = 6

// 最新发布帖子（原首页 latest tab 迁移至此）：search_after 游标翻页
const recentPosts = ref([])
const loading = ref(false)     // 首屏
const loadingMore = ref(false) // 加载更多
const searchAfter = ref('')    // 游标原样透传
const hasMore = ref(false)

// 后端 snake_case → RecentPostCard 期望字段
const transformPost = (p) => {
  const ts = new Date(p.create_time || '').getTime()
  return {
    postId: p.id,
    circleName: p.circle_name || '',
    title: p.title || '',
    content: p.summary || p.content || '',
    images: p.images || [],
    postTime: isNaN(ts) ? Date.now() : ts, // NTime 接受 number|Date
    likeCount: p.like_count || 0,
    commentCount: p.comment_count || 0
  }
}

// 拉取最新帖子：append=true 追加下一页
const fetchLatest = async (append = false) => {
  if (append ? loadingMore.value : loading.value) return
  if (append) loadingMore.value = true
  else loading.value = true
  try {
    const params = { tab: 'latest', size: PAGE_SIZE }
    if (append && searchAfter.value) params.search_after = searchAfter.value

    const res = await getHomeFeed(params)
    const data = res.data || {}
    const list = (data.posts || []).map(transformPost)
    recentPosts.value = append ? [...recentPosts.value, ...list] : list

    searchAfter.value = data.search_after || ''
    // has_more=false 时不返回 search_after；二者同时判断更稳妥
    hasMore.value = !!data.has_more && !!searchAfter.value
  } catch (error) {
    console.error('获取最新帖子失败:', error)
    message.error(error.message || t('feed.loadFailed'))
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const handleLoadMore = () => fetchLatest(true)

onMounted(() => fetchLatest(false))
</script>

<style scoped>
.right-sidebar {
  position: sticky;
  top: calc(var(--header-height) + 16px);
  width: 22dvw;
  max-height: calc(100vh - var(--header-height) - 48px);
  z-index: 100;
  flex-shrink: 0;
  align-self: flex-start;
}

.sidebar-content {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  max-height: calc(100vh - var(--header-height) - 48px);
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideInRight 0.5s ease;
}

/* 隐藏滚动条 */
.sidebar-content {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.sidebar-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 标题区域 */
.sidebar-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 6px 0;
}

.title-icon {
  width: 20px;
  height: 20px;
  color: #6bf9bbcb;
}

.sidebar-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* 帖子列表 */
.recent-posts-list {
  display: flex;
  flex-direction: column;
}

/* 加载更多 */
.load-more {
  display: flex;
  justify-content: center;
  padding: 16px 0 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 0.9rem;
  margin: 0;
}

/* 动画 */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式 */
@media (max-width: 1600px) {
  .right-sidebar {
    width: 320px;
  }
}

@media (max-width: 1400px) {
  .right-sidebar {
    width: 300px;
  }
}

/* NaiveUI 样式覆盖 */
:deep(.n-button) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.n-button:hover) {
  color: rgba(255, 255, 255, 0.95) !important;
  background: rgba(255, 255, 255, 0.08) !important;
}
</style>
