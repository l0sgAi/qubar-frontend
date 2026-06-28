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
            <NTabs animated v-model:value="activeTab" @update:value="handleTabChange">
              <NTabPane
                v-for="tab in TABS"
                :key="tab.name"
                :name="tab.name"
                :tab="t(tab.label)"
                display-directive="if"
              >
                <!-- 首屏加载 -->
                <div v-if="loading && !isAppending" class="feed-loading">
                  <NSpin size="medium" />
                </div>
                <!-- 空态：following 引导加圈，其余通用空文案 -->
                <div v-else-if="posts.length === 0" class="feed-empty">
                  {{ activeTab === 'following' ? t('feed.emptyFollowing') : t('feed.empty') }}
                </div>
                <!-- 帖子列表 -->
                <PostList v-else :posts="posts" />
              </NTabPane>
            </NTabs>

            <!-- 翻页加载中 / 没有更多（统一单实例，置于 tabs 之外） -->
            <template v-if="posts.length > 0">
              <div v-if="isAppending" class="feed-loading-more">{{ t('common.loading') }}</div>
              <div v-else-if="!hasMore" class="feed-no-more">{{ t('common.noMore') }}</div>
            </template>
            <!-- 无限滚动哨兵 -->
            <div ref="sentinel" class="feed-sentinel"></div>
          </div>
        </div>
      </div>

      <!-- 右侧信息栏 -->
      <RightSidebar />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { NTabs, NTabPane, NSpin, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import SideNav from '@/components/SideNav.vue'
import PostList from '@/components/PostList.vue'
import RightSidebar from '@/components/RightSidebar.vue'
import { getHomeFeed } from '@/api/post'
import { auth } from '@/utils/auth'
import request from '@/utils/request'

const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const offset = ref(260)

// 3 个 tab 共用 /post/home 端点（latest 已迁移至 RightSidebar）
const TABS = [
  { name: 'recommend', label: 'nav.recommend' },
  { name: 'hot', label: 'nav.hot' },
  { name: 'following', label: 'nav.following' }
]

const PAGE_SIZE = 20

// 统一信息流状态：切 tab 时清空本地列表 + 游标（遵循文档第 8 节，
// 避免把 recommend 的 pool_token 带到 hot/latest/following）
const activeTab = ref('recommend')
const posts = ref([])
const loading = ref(false)
const isAppending = ref(false) // true=追加翻页（底部加载条）；false=首屏/切 tab（NSpin）
const hasMore = ref(false)
const poolToken = ref('')   // 仅 recommend：候选池版本 token，翻页原样回传
const searchAfter = ref('') // 仅 hot/latest/following：游标原样透传

// 无限滚动
const sentinel = ref(null)
let observer = null

// 首屏/切 tab 的拉取世代：每次自增，用于丢弃切换竞态期间的过期响应
// （在飞请求未真正 abort，但其响应到达时若世代已变则忽略）
let fetchGen = 0

// 后端 snake_case → 组件 camelCase（PostList/PostCard 期望的字段）
const transformPost = (p) => {
  const ts = new Date(p.create_time || '').getTime()
  return {
    postId: p.id,
    circleId: p.circle_id,
    circleName: p.circle_name || '',
    circleAvatar: p.circle_avatar || '',
    userId: p.user_id,
    userName: p.author_name || '',
    userAvatar: p.author_avatar || '',
    title: p.title || '',
    content: p.summary || p.content || '',
    images: p.images || [],
    postTime: isNaN(ts) ? Date.now() : ts, // NTime 接受 number|Date
    viewCount: p.view_count || 0,
    likeCount: p.like_count || 0,
    commentCount: p.comment_count || 0,
    collectCount: p.collect_count || 0,
    // 当前列表项是否已点赞/已收藏（PostCard 暂未渲染高亮，预留后续接入）
    isLiked: !!p.is_liked,
    isCollected: !!p.is_collected
  }
}

// 拉取信息流：append=true 表示追加下一页
const fetchFeed = async (append = false) => {
  // 追加翻页：已有请求在飞则跳过，避免重复追加
  if (append && loading.value) return
  // 首屏/切 tab：自增世代，使之前在飞的请求响应作废（切换竞态保护）
  if (!append) fetchGen++
  const gen = fetchGen

  loading.value = true
  isAppending.value = append
  try {
    const params = { tab: activeTab.value, size: PAGE_SIZE }
    if (activeTab.value === 'recommend') {
      // 候选池翻页：首页不传 offset/pool_token；翻页回传 pool_token + offset=已消费条数
      if (append && poolToken.value) {
        params.offset = posts.value.length
        params.pool_token = poolToken.value
      }
    } else {
      // 游标翻页：search_after 原样透传（axios 自动 URL-encode）
      if (append && searchAfter.value) {
        params.search_after = searchAfter.value
      }
    }

    const res = await getHomeFeed(params)
    // 切 tab 竞态：期间又发起了新的首屏拉取，丢弃本次过期响应
    if (gen !== fetchGen) return
    const data = res.data || {}
    const list = (data.posts || []).map(transformPost)

    // recommend 池已重建：服务端回了 offset=0 的第 1 页，需重置本地列表到第 1 页
    if (data.pool_refreshed) {
      posts.value = list
      message.info(t('feed.refreshed'))
    } else {
      posts.value = append ? [...posts.value, ...list] : list
    }

    // 更新游标与是否还有更多
    if (activeTab.value === 'recommend') {
      poolToken.value = data.pool_token || ''
      hasMore.value = !!data.has_more
    } else {
      searchAfter.value = data.search_after || ''
      // has_more=false 时不返回 search_after；二者同时判断更稳妥
      hasMore.value = !!data.has_more && !!searchAfter.value
    }
  } catch (error) {
    // 过期请求的错误不再提示
    if (gen !== fetchGen) return
    console.error('获取首页信息流失败:', error)
    message.error(error.message || t('feed.loadFailed'))
  } finally {
    // 仅当前世代才复位 loading，避免过期请求把 loading 提前置 false
    if (gen === fetchGen) loading.value = false
  }
}

// 切 tab：清空本地列表 + 游标，用对应 tab 首页参数重新拉
const handleTabChange = (tab) => {
  activeTab.value = tab
  posts.value = []
  poolToken.value = ''
  searchAfter.value = ''
  hasMore.value = false
  if (observer) {
    observer.disconnect()
    observer = null
  }
  fetchFeed(false)
}

// 无限滚动：sentinel 进入视口时加载下一页（提前 200px 触发，体验更顺滑）
const setupObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (!sentinel.value || !hasMore.value || loading.value) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value && !loading.value) {
        fetchFeed(true)
      }
    },
    { rootMargin: '200px' }
  )
  observer.observe(sentinel.value)
}

watch([sentinel, hasMore, loading], setupObserver)

onMounted(() => {
  // 推荐流强制登录：未登录跳登录页
  if (!auth.isAuthenticated()) {
    message.warning(t('messages.loginRequired'))
    router.push('/')
    return
  }
  fetchFeed(false)
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
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

/* 信息流：加载 / 空态 / 尾标 / 哨兵 */
.feed-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.feed-loading-more,
.feed-no-more {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
  padding: 16px 0;
}

.feed-empty {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.95rem;
  padding: 64px 24px;
  line-height: 1.6;
}

.feed-sentinel {
  height: 1px;
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
