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
            :circle-color="post.circleColor"
            :title="post.title"
            :content="post.content"
            :images="post.images"
            :post-time="post.postTime"
            :like-count="post.likeCount"
            :comment-count="post.commentCount"
          />
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore" class="load-more">
          <NButton text @click="handleLoadMore">
            <template #icon>
              <NIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </NIcon>
            </template>
            {{ t('post.recent.loadMore') }}
          </NButton>
        </div>

        <!-- 空状态 -->
        <div v-if="recentPosts.length === 0" class="empty-state">
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
import { ref } from 'vue'
import { NConfigProvider, NButton, NIcon, darkTheme, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import RecentPostCard from './RecentPostCard.vue'

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

// 示例近期帖子数据（按时间排序）
const recentPosts = ref([
  {
    postId: '101',
    circleName: 'Vue.js 开发者',
    circleColor: '#42b883',
    title: 'Vue 3.4 新特性抢先看',
    content: 'Vue 3.4 带来了很多令人兴奋的新特性，包括性能优化、新的编译器宏等...',
    images: ['https://picsum.photos/400/400?random=101'],
    postTime: new Date(Date.now() - 1000 * 60 * 5), // 5分钟前
    likeCount: 23,
    commentCount: 5
  },
  {
    postId: '102',
    circleName: 'React 社区',
    circleColor: '#06b6d4',
    title: 'React Server Components 实践',
    content: '分享一下在实际项目中使用 React Server Components 的经验和踩坑记录...',
    images: ['https://picsum.photos/400/400?random=102'],
    postTime: new Date(Date.now() - 1000 * 60 * 15), // 15分钟前
    likeCount: 45,
    commentCount: 12
  },
  {
    postId: '103',
    circleName: 'UI/UX 设计',
    circleColor: '#ec4899',
    title: 'Figma 新插件推荐',
    content: '最近发现了一些非常好用的 Figma 插件，能大大提升设计效率...',
    images: ['https://picsum.photos/400/400?random=103'],
    postTime: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
    likeCount: 67,
    commentCount: 18
  },
  {
    postId: '104',
    circleName: '前端技术交流',
    circleColor: '#3b82f6',
    title: 'Vite 构建优化技巧',
    content: '整理了一些 Vite 构建优化的实用技巧，包括代码分割、资源优化等...',
    images: [],
    postTime: new Date(Date.now() - 1000 * 60 * 45), // 45分钟前
    likeCount: 89,
    commentCount: 23
  },
  {
    postId: '105',
    circleName: '摄影爱好者',
    circleColor: '#f59e0b',
    title: '秋日摄影技巧分享',
    content: '秋天是拍照的好季节，分享一些秋日摄影的构图和用光技巧...',
    images: ['https://picsum.photos/400/400?random=105'],
    postTime: new Date(Date.now() - 1000 * 60 * 60), // 1小时前
    likeCount: 156,
    commentCount: 34
  },
  {
    postId: '106',
    circleName: 'Node.js 开发',
    circleColor: '#22c55e',
    title: 'NestJS 最佳实践',
    content: '总结了一些在 NestJS 项目中的最佳实践，包括模块化设计、依赖注入等...',
    images: [],
    postTime: new Date(Date.now() - 1000 * 60 * 90), // 1.5小时前
    likeCount: 78,
    commentCount: 15
  }
])

const hasMore = ref(true)

const handleLoadMore = () => {
  message.info('加载更多功能开发中...')
  console.log('Load more recent posts')
}
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
