<template>
  <div class="home-page">
    <!-- 顶栏 -->
    <AppHeader />

    <!-- 侧边栏 -->
    <SideNav @collapsed="offset = 64" @expanded="offset = 260" />

    <!-- 主内容区域和右侧栏的容器 -->
    <div class="content-wrapper" :style="{ 'margin-left': `${offset}px`, width: `calc(100% - ${offset}px)` }">
      <!-- 主内容区域 -->
      <div class="main-content">
        <div class="home-container">
          <div class="content-header">
            <NTabs animated>
              <NTabPane name="recommend" :tab="t('nav.recommend')">
                <PostList :posts="recommendPosts" />
              </NTabPane>
              <NTabPane name="following" :tab="t('nav.following')">
                <PostList :posts="followingPosts" />
              </NTabPane>
              <NTabPane name="hot" :tab="t('nav.hot')">
                <PostList :posts="hotPosts" />
              </NTabPane>
            </NTabs>
          </div>
        </div>
      </div>

      <!-- 右侧信息栏 -->
      <RightSidebar />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { NTabs, NTabPane, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import SideNav from '@/components/SideNav.vue'
import PostList from '@/components/PostList.vue'
import RightSidebar from '@/components/RightSidebar.vue'
import { auth } from '@/utils/auth'
import request from '@/utils/request'

const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const offset = ref(260)

// 示例帖子数据
const recommendPosts = ref([
  {
    postId: '1',
    circleId: null,
    circleName: 'Vue.js 开发者',
    circleAvatar: '',
    circleColor: '#42b883',
    userName: '张三',
    userColor: '#22c55e',
    title: 'Vue 3 Composition API 最佳实践',
    content: '分享一些在 Vue 3 项目中使用 Composition API 的最佳实践，包括响应式数据管理、组件复用等技巧...',
    images: [
      'https://picsum.photos/800/500?random=1',
      'https://picsum.photos/800/500?random=2'
    ],
    postTime: new Date(Date.now() - 1000 * 60 * 30),
    likeCount: 234,
    commentCount: 45,
    collectCount: 12
  },
  {
    postId: '2',
    circleId: null,
    circleName: 'UI/UX 设计',
    circleAvatar: '',
    circleColor: '#ec4899',
    userName: '李四',
    userColor: '#f97316',
    title: '2024年最流行的设计趋势',
    content: '总结了一下今年最流行的设计趋势，包括玻璃拟态、新拟物化、暗色模式等...',
    images: [
      'https://picsum.photos/800/500?random=3',
      'https://picsum.photos/800/500?random=4',
      'https://picsum.photos/800/500?random=5'
    ],
    postTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likeCount: 567,
    commentCount: 89,
    collectCount: 34
  },
  {
    postId: '3',
    circleId: null,
    circleName: '前端技术交流',
    circleAvatar: '',
    circleColor: '#3b82f6',
    userName: '王五',
    userColor: '#8b5cf6',
    title: '如何优化前端性能',
    content: '从前端性能优化的角度出发，分享一些实用的技巧和工具...',
    images: [],
    postTime: new Date(Date.now() - 1000 * 60 * 60 * 5),
    likeCount: 892,
    commentCount: 156,
    collectCount: 67
  }
])

const followingPosts = ref([
  {
    postId: '4',
    circleId: null,
    circleName: '摄影爱好者',
    circleAvatar: '',
    circleColor: '#f59e0b',
    userName: '赵六',
    userColor: '#06b6d4',
    title: '周末去公园拍的照片',
    content: '今天天气真好，去公园拍了一些风景照，大家觉得怎么样？',
    images: [
      'https://picsum.photos/800/500?random=6',
      'https://picsum.photos/800/500?random=7',
      'https://picsum.photos/800/500?random=8',
      'https://picsum.photos/800/500?random=9'
    ],
    postTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    likeCount: 1234,
    commentCount: 234,
    collectCount: 89
  }
])

const hotPosts = ref([
  {
    postId: '5',
    circleId: null,
    circleName: 'React 社区',
    circleAvatar: '',
    circleColor: '#06b6d4',
    userName: '孙七',
    userColor: '#ec4899',
    title: 'React 18 新特性详解',
    content: 'React 18 带来了很多新特性，比如并发渲染、自动批处理等...',
    images: [
      'https://picsum.photos/800/500?random=10'
    ],
    postTime: new Date(Date.now() - 1000 * 60 * 60 * 48),
    likeCount: 5678,
    commentCount: 890,
    collectCount: 234
  }
])

onMounted(() => {
  // 检查登录状态
  if (!auth.isAuthenticated()) {
    message.warning(t('messages.loginRequired'))
    router.push('/')
    return
  }
})

const handleLogout = async () => {
  try {
    // 调用后端登出接口
    await request.post('/auth/logout')

    // 清除本地 token
    auth.clearToken()
    message.success(t('common.logoutSuccess'))
    router.push('/')
  } catch (error) {
    // 即使接口调用失败，也清除本地 token
    auth.clearToken()
    message.warning(t('common.logout'))
    router.push('/')
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

.content-wrapper {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: var(--header-height);
  min-height: calc(100vh - var(--header-height));
  transition: margin-left 0.3s ease, width 0.3s ease;
}

.main-content {
  padding: 24px;
  min-height: calc(100vh - var(--header-height));
  max-width: 780px;
  width: 100%;
}

.home-container {
  width: 100%;
  margin: 0 auto;
}

.content-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ec4899 0%, #a855f7 25%, #3b82f6 50%, #06b6d4 75%, #22c55e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
}

.home-content {
  animation: fadeIn 0.5s ease;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}
.title {
  font-size: 2rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 60px;
  height: 60px;
  background: var(--primary-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.info {
  flex: 1;
}

.label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.status {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
}

.token-debug {
  margin: 20px 0;
}

.token-debug h3 {
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 16px;
}

.token-debug p {
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-size: 0.875rem;
}

.actions {
  margin-top: 24px;
  text-align: center;
}

:deep(.n-card) {
  background: transparent !important;
}

:deep(.n-divider) {
  border-color: var(--glass-border) !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
  }

  .right-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    margin-left: 0;
    padding: 0;
  }

  .main-content {
    padding: 16px;
  }

  .right-sidebar {
    display: none;
  }
}
</style>
