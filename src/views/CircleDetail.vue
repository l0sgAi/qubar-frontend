<template>
  <div class="circle-detail-page">
    <!-- 顶栏 -->
    <AppHeader />

    <!-- 侧边栏 -->
    <SideNav @collapsed="offset = 64" @expanded="offset = 260" />

    <!-- 主内容区域 -->
    <div class="main-content" :style="{ 'margin-left': `${offset}px`, width: `calc(100% - ${offset}px)` }">
      <!-- 加载骨架：切换圈子时显示，避免停留在上一个圈子的内容 -->
      <div v-if="loading" class="detail-skeleton">
        <!-- 头部 banner：全宽，对齐真实 .circle-header -->
        <div class="sk-header">
          <div class="sk-header-overlay">
            <div class="sk-avatar"></div>
            <div class="sk-title-block">
              <div class="sk-hline sk-hline--title"></div>
              <div class="sk-hline sk-hline--sub"></div>
            </div>
          </div>
        </div>
        <!-- 内容骨架：左帖子 + 右信息栏 -->
        <div class="sk-content">
          <div class="sk-posts">
            <div class="sk-tabs"></div>
            <div class="sk-post-card" v-for="n in 4" :key="n"></div>
          </div>
          <div class="sk-sidebar">
            <div class="sk-card">
              <div class="sk-line sk-line--card-title"></div>
              <div class="sk-line sk-line--full"></div>
              <div class="sk-line sk-line--full"></div>
              <div class="sk-line sk-line--short"></div>
            </div>
          </div>
        </div>
      </div>
      <template v-else>
      <!-- 圈子头部信息 -->
      <div class="circle-header" :style="{ backgroundImage: coverImageStyle }">
        <div class="header-overlay">
          <div class="header-content">
            <!-- 头像和名称区域 -->
            <div class="circle-avatar-wrapper">
              <img v-if="circleDetail.avatar_url" :src="circleDetail.avatar_url" class="circle-avatar" />
              <div v-else class="circle-avatar-placeholder">
                {{ circleDetail.name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <div class="circle-info">
                <h1 class="circle-name">{{ circleDetail.name }}</h1>
                <p class="circle-slug">c/{{ circleDetail.slug || circleDetail.id }}</p>
              </div>
            </div>

            <!-- 操作按钮组 -->
            <div class="action-buttons">
              <!-- 免打扰按钮 -->
              <NButton
                v-if="circleDetail.is_joined"
                size="large"
                quaternary
                round
                @click="handleToggleDisturb"
                :type="circleDetail.member_is_disturb ? 'warning' : 'default'"
              >
                <template #icon>
                  <NIcon>
                    <BellOffIcon v-if="circleDetail.member_is_disturb" />
                    <BellIcon v-else />
                  </NIcon>
                </template>
                {{ circleDetail.member_is_disturb ? t('circle.disturbOn') : t('circle.disturbOff') }}
              </NButton>

              <!-- 创建帖子按钮 -->
              <NButton
                v-if="circleDetail.is_joined"
                size="large"
                type="primary"
                round
                @click="handleCreatePost"
              >
                <template #icon>
                  <NIcon><EditIcon /></NIcon>
                </template>
                {{t('post.createPost')}}
              </NButton>

              <!-- 管理按钮（圈主/管理员可见），有待审核申请时显示数量角标 -->
              <NButton
                v-if="canManage"
                size="large"
                type="primary"
                secondary
                round
                @click="router.push(`/circle/${circleDetail.id}/members`)"
              >
                <template #icon>
                  <NIcon><ShieldCheckIcon /></NIcon>
                </template>
                {{ t('circle.manage.entry') }}
                <span v-if="pendingModCount > 0" class="manage-badge">
                  {{ pendingModFull ? t('circle.manage.badgeFull') : pendingModCount }}
                </span>
              </NButton>

              <!-- 加入/退出按钮 -->
              <NButton
                v-if="!circleDetail.is_joined"
                type="primary"
                size="large"
                round
                @click="handleJoinCircle"
                :loading="joinLoading"
              >
              {{t('circle.joinCircle')}}
              </NButton>
              <NButton
                v-else
                size="large"
                @click="handleLeaveCircle"
                round
                ghost
                :loading="joinLoading"
                @mouseenter="isButtonHovered = true"
                @mouseleave="isButtonHovered = false"
                :type="isButtonHovered ? 'error' : 'primary'"
              >
                {{ isButtonHovered ? t('circle.leaveCircle') : t('circle.joined') }}
              </NButton>

              <!-- 更多选项下拉菜单 -->
              <NDropdown :options="moreOptions" @select="handleMoreSelect">
                <NButton size="large" quaternary round>
                  <template #icon>
                    <NIcon><MoreIcon /></NIcon>
                  </template>
                </NButton>
              </NDropdown>
            </div>
          </div>
        </div>
      </div>
      <div class="mid-con">
           <!-- 内容容器：包含帖子列表和右侧信息栏 -->
      <div class="content-container">
        <!-- 帖子列表区域 -->
        <div class="posts-section">
          <NTabs v-model:value="activeTab" type="segment" animated>
            <NTabPane name="hot" :tab="t('post.hottest')">
              <div class="posts-list">
                <div v-if="hotPosts.length === 0 && !hotLoading" class="empty-state">
                  <p>{{t('post.noPosts')}}</p>
                </div>
                <div v-else>
                  <PostList :posts="hotPosts" />
                </div>
                <div ref="hotSentinel" class="load-sentinel"></div>
                <!-- 首次加载用骨架屏；追加翻页保留底部小 spinner -->
                <PostListSkeleton v-if="hotLoading && hotPosts.length === 0" />
                <div v-else-if="hotLoading" class="loading-state">
                  <NSpin size="small" />
                </div>
              </div>
            </NTabPane>
            <NTabPane name="new" :tab="t('post.latest')">
              <div class="posts-list">
                <div v-if="newPosts.length === 0 && !newLoading" class="empty-state">
                  <p>{{t('post.noPosts')}}</p>
                </div>
                <div v-else>
                  <PostList :posts="newPosts" />
                </div>
                <div ref="newSentinel" class="load-sentinel"></div>
                <!-- 首次加载用骨架屏；追加翻页保留底部小 spinner -->
                <PostListSkeleton v-if="newLoading && newPosts.length === 0" />
                <div v-else-if="newLoading" class="loading-state">
                  <NSpin size="small" />
                </div>
              </div>
            </NTabPane>
            <NTabPane name="top" :tab="t('post.highlights')">
              <div class="posts-list">
                <div v-if="topPosts.length === 0 && !topLoading" class="empty-state">
                  <p>{{t('post.noPosts')}}</p>
                </div>
                <div v-else>
                  <PostList :posts="topPosts" />
                </div>
                <div ref="topSentinel" class="load-sentinel"></div>
                <!-- 首次加载用骨架屏；追加翻页保留底部小 spinner -->
                <PostListSkeleton v-if="topLoading && topPosts.length === 0" />
                <div v-else-if="topLoading" class="loading-state">
                  <NSpin size="small" />
                </div>
              </div>
            </NTabPane>
          </NTabs>
        </div>

        <!-- 右侧信息栏 -->
        <div class="right-sidebar-header">
          <div class="sidebar-card">
            <div class="card-header">
              <h3>{{ t('circle.aboutCircle') }}</h3>
            </div>
            <div class="card-body">
              <!-- 统计数据 -->
              <div class="circle-stats-sidebar">
                <div class="stat-item">
                  <NIcon size="20" color="rgba(255,255,255,0.6)">
                    <UserIcon />
                  </NIcon>
                  <div class="stat-content">
                    <span class="stat-value">{{ formatNumber(circleDetail.member_count) }}</span>
                    <span class="stat-label">{{ t('circle.members') }}</span>
                  </div>
                </div>
                <div class="stat-item">
                  <NIcon size="20" color="rgba(255,255,255,0.6)">
                    <FileTextIcon />
                  </NIcon>
                  <div class="stat-content">
                    <span class="stat-value">{{ formatNumber(circleDetail.post_count) }}</span>
                    <span class="stat-label">{{ t('circle.posts') }}</span>
                  </div>
                </div>
                <div class="stat-item">
                  <NIcon size="20" color="rgba(255,255,255,0.6)">
                    <FlameIcon />
                  </NIcon>
                  <div class="stat-content">
                    <span class="stat-value">{{ circleDetail.hot }}</span>
                    <span class="stat-label">{{ t('circle.hotness') }}</span>
                  </div>
                </div>
              </div>

              <div class="description-section">
                <h4 class="section-title">{{ t('circle.description') }}</h4>
                <p class="description">{{ getDisplayDescription(circleDetail.description) || t('circle.noDescription') }}</p>
                <div
                  v-if="shouldShowMoreButton(circleDetail.description)"
                  class="show-more-btn"
                  @click="toggleDescription"
                >
                  {{ isDescriptionExpanded ? t('common.collapse') : t('common.showMore') }}
                </div>
              </div>

              <div class="circle-info">
                <div class="info-row">
                  <span class="label">{{ t('time.createdAt') }}</span>
                  <span class="value">{{ formatDate(circleDetail.create_time) }}</span>
                </div>
                <!-- <div class="info-row">
                  <span class="label">分类</span>
                  <span class="value">{{ categoryName || '未分类' }}</span>
                </div> -->
                <div class="info-row">
                  <span class="label">{{ t('circle.joinType') }}</span>
                  <span class="value">{{ getJoinTypeText(circleDetail.join_type) }}</span>
                </div>
              </div>

              <div v-if="circleDetail.is_joined" class="member-info">
                <h4 class="section-title">{{ t('circle.yourMemberInfo') }}</h4>
                <div class="info-row">
                  <span class="label">{{ t('user.role') }}</span>
                  <NTag :type="getRoleInfo(circleDetail.member_role).type" size="large" round>
                    {{ getRoleInfo(circleDetail.member_role).text }}
                  </NTag>
                </div>
                <div class="info-row">
                  <span class="label">{{ t('user.status') }}</span>
                  <NTag :type="getMemberStatusInfo(circleDetail.member_status).type" size="large" round>
                    {{ getMemberStatusInfo(circleDetail.member_status).text }}
                  </NTag>
                </div>
                <div v-if="circleDetail.member_is_top" class="info-row">
                  <span class="label">{{ t('circle.pinnedDisplay') }}</span>
                  <span class="value">{{ t('common.yes') }}</span>
                </div>
                <div v-if="circleDetail.member_is_disturb" class="info-row">
                  <span class="label">{{ t('circle.messageDisturb') }}</span>
                  <span class="value">{{ t('common.enabled') }}</span>
                </div>
              </div>

              <div v-if="circleDetail.rule" class="rules-section">
                <h4 class="section-title">{{ t('circle.rules') }}</h4>
                <p class="rules">{{ circleDetail.rule }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NTabs, NTabPane, NButton, NIcon, NDropdown, NTag, NSpin, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import SideNav from '@/components/SideNav.vue'
import PostList from '@/components/PostList.vue'
import PostListSkeleton from '@/components/PostListSkeleton.vue'
import { getCircleDetail, joinCircle, leaveCircle, getCirclePosts, getCircleMembers } from '@/api/circle'
import { auth } from '@/utils/auth'
import { requireLogin } from '@/utils/guest-action'
import { useCircleMeta } from '@/composables/useCircleMeta'
import { isManager, MEMBER_PAGE_SIZE } from '@/constants/circle'
import { Bell as BellIcon, BellOff as BellOffIcon, Edit as EditIcon, DotsVertical as MoreIcon } from '@vicons/tabler'
import { User as UserIcon, FileText as FileTextIcon, Flame as FlameIcon } from '@vicons/tabler'
import { ShieldCheck as ShieldCheckIcon } from '@vicons/tabler'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const offset = ref(260)

// 注入圈子搜索状态设置方法
const setCircleSearch = inject('setCircleSearch', () => {})

// 更多选项下拉菜单
const moreOptions = computed(() => {
  const options = [
    {
      label: t('circle.shareCircle'),
      key: 'share'
    },
    {
      label: t('circle.report'),
      key: 'report'
    }
  ]

  return options
})

// 圈子详情数据
const circleDetail = ref({
  id: 0,
  name: '',
  slug: '',
  avatar_url: '',
  cover_url: '',
  description: '',
  rule: '',
  creator_id: 0,
  category_id: 0,
  hot: 0,
  member_count: 0,
  post_count: 0,
  join_type: 0,
  status: 0,
  create_time: new Date(),
  update_time: new Date(),
  is_joined: false,
  member_role: 0,
  member_status: 0,
  member_mute_end_time: null,
  member_is_top: 0,
  member_is_disturb: 0
})

const categoryName = ref('')
// 初始为 true：首次进入与切换圈子时都先显示骨架，避免闪现空内容/旧内容
const loading = ref(true)
const joinLoading = ref(false)
const activeTab = ref('hot')
const isButtonHovered = ref(false)
const isDescriptionExpanded = ref(false)

// 简介折叠展开
const toggleDescription = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value
}

const getDisplayDescription = (description) => {
  if (!description) return ''
  if (isDescriptionExpanded.value) return description
  return description.length > 200 ? description.substring(0, 200) + ' ......' : description
}

const shouldShowMoreButton = (description) => {
  return description && description.length > 200
}

// 帖子列表数据
const hotPosts = ref([])
const newPosts = ref([])
const topPosts = ref([])

const hotLoading = ref(false)
const newLoading = ref(false)
const topLoading = ref(false)

const hotSearchAfter = ref('')
const newSearchAfter = ref('')
const topSearchAfter = ref('')

const hotHasMore = ref(true)
const newHasMore = ref(true)
const topHasMore = ref(true)

const POST_PAGE_SIZE = 20

const tabTypeMap = { hot: 1, new: 2, top: 3 }
const tabStateMap = {
  hot: { posts: hotPosts, loading: hotLoading, searchAfter: hotSearchAfter, hasMore: hotHasMore },
  new: { posts: newPosts, loading: newLoading, searchAfter: newSearchAfter, hasMore: newHasMore },
  top: { posts: topPosts, loading: topLoading, searchAfter: topSearchAfter, hasMore: topHasMore }
}

const transformPostData = (apiPosts) => {
  return apiPosts.map(post => ({
    postId: post.id,
    circleId: post.circle_id,
    circleName: post.circle_name || '',
    circleAvatar: post.circle_avatar || '',
    userId: post.user_id || null,
    userName: post.author_name || '',
    userAvatar: post.author_avatar || '',
    title: post.title || '',
    content: post.summary || post.content || '',
    images: post.images || [],
    postTime: post.create_time || '',
    viewCount: post.view_count || 0,
    likeCount: post.like_count || 0,
    commentCount: post.comment_count || 0,
    collectCount: post.collect_count || 0,
    showCircle: false
  }))
}

const fetchPosts = async (tab, append = false) => {
  const state = tabStateMap[tab]
  if (!state || state.loading.value || (!append && !state.hasMore.value)) return

  state.loading.value = true
  try {
    const params = {
      circle_id: circleDetail.value.id,
      type: tabTypeMap[tab],
      size: POST_PAGE_SIZE
    }
    if (append && state.searchAfter.value) {
      params.search_after = state.searchAfter.value
    }

    const response = await getCirclePosts(params)
    if (response.data) {
      const newPosts = transformPostData(response.data.posts || [])
      if (append) {
        state.posts.value = [...state.posts.value, ...newPosts]
      } else {
        state.posts.value = newPosts
      }
      state.searchAfter.value = response.data.search_after || ''
      state.hasMore.value = !!response.data.search_after
    }
  } catch (error) {
    message.error(t('messages.getDetailFailed', { error: error.message || t('common.unknownError') }))
  } finally {
    state.loading.value = false
  }
}

// Tab 切换时清空并重新加载
watch(activeTab, (newTab) => {
  const state = tabStateMap[newTab]
  if (state.posts.value.length === 0 && state.hasMore.value) {
    fetchPosts(newTab)
  }
})

// 背景图样式
const coverImageStyle = computed(() => {
  if (circleDetail.value.cover_url) {
    return `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(16,16,28,1)), url(${circleDetail.value.cover_url})`
  }
  return 'linear-gradient(135deg, rgba(34,197,94,0.8) 0%, rgba(16,185,129,0.8) 25%, rgba(20,184,166,0.8) 50%, rgba(59,130,246,0.8) 75%, rgba(234,179,8,0.8) 100%)'
})

// 格式化数字
const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return t('common.unknown')
  const date = new Date(dateStr)
  const locale = t('common.unknown') === 'Unknown' ? 'en-US' : 'zh-CN'
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 角色/状态/加入方式文案映射（与成员管理页共用，含 0-4 全量状态）
const { getRoleInfo, getMemberStatusInfo, getJoinTypeText } = useCircleMeta()

// 获取圈子详情
const fetchCircleDetail = async () => {
  const circleId = route.params.id
  if (!circleId) {
    message.error(t('circle.circleIdNotFound'))
    router.push('/home')
    return
  }

  loading.value = true
  try {
    const response = await getCircleDetail(circleId)
    if (response.data) {
      circleDetail.value = response.data
      // 如果成员状态为4（已退出），则修正 is_joined 为 false
      if (circleDetail.value.member_status === 4) {
        circleDetail.value.is_joined = false
      }

      // 设置圈子搜索状态
      setCircleSearch({
        id: circleDetail.value.id,
        name: circleDetail.value.name,
        avatar_url: circleDetail.value.avatar_url
      })

      // 管理角色时拉取待审核数，供管理入口角标展示
      fetchPendingModCount()

      // TODO: 根据category_id获取分类名称
    }
  } catch (error) {
    message.error(t('messages.getDetailFailed', { error: error.message || t('common.unknownError') }))
    router.push('/home')
  } finally {
    loading.value = false
  }
}

// 加入圈子
const handleJoinCircle = async () => {
  // 访客加圈前置拦截：弹登录引导
  if (!auth.isAuthenticated()) {
    requireLogin('join')
    return
  }
  joinLoading.value = true
  try {
    await joinCircle({ circle_id: circleDetail.value.id })
    message.success(t('circle.joinSuccess'))
    // 重新获取圈子详情，同步刷新侧栏统计数据
    await fetchCircleDetail()
  } catch (error) {
    message.error(t('circle.joinFailed') + '：' + (error.message || t('common.unknownError')))
  } finally {
    joinLoading.value = false
  }
}

// 退出圈子
const handleLeaveCircle = async () => {
  // 防御性检查：退出需登录（按钮本身只在已加入成员处显示）
  if (!auth.isAuthenticated()) {
    requireLogin('join')
    return
  }
  joinLoading.value = true
  isButtonHovered.value = false
  try {
    await leaveCircle({ circle_id: circleDetail.value.id })
    message.success(t('circle.leaveSuccess'))
    // 重新获取圈子详情，同步刷新侧栏统计数据
    await fetchCircleDetail()
  } catch (error) {
    message.error(t('circle.leaveFailed') + '：' + (error.message || t('common.unknownError')))
  } finally {
    joinLoading.value = false
  }
}

// 切换免打扰
const handleToggleDisturb = async () => {
  try {
    // TODO: 调用切换免打扰接口
    circleDetail.value.member_is_disturb = !circleDetail.value.member_is_disturb
    message.success(circleDetail.value.member_is_disturb ? t('circle.disturbEnabled') : t('circle.disturbDisabled'))
  } catch (error) {
    message.error(t('messages.operationFailed', { error: error.message || t('common.unknownError') }))
  }
}

// 创建帖子
const handleCreatePost = () => {
  // TODO: 跳转到发帖页面，并传递圈子ID
  router.push(`/create-post?circleId=${circleDetail.value.id}`)
}

// 更多选项处理
const handleMoreSelect = (key) => {
  switch (key) {
    case 'share':
      message.info(t('common.featureInDevelopment'))
      break
    case 'report':
      message.info(t('common.featureInDevelopment'))
      break
  }
}

// ---------- 管理入口（圈主/管理员） ----------

const canManage = computed(() => isManager(circleDetail.value.member_role))

// 待审核角标（入口提示）：拉一页 status=0&size=20，满页显示「20+」
const pendingModCount = ref(0)
const pendingModFull = ref(false)

// 世代守卫：切换圈子后旧请求的响应直接丢弃，防止角标被上一个圈子的数据覆盖
let pendingModGen = 0

const fetchPendingModCount = async () => {
  const gen = ++pendingModGen
  if (!canManage.value) return
  try {
    const res = await getCircleMembers({
      circle_id: circleDetail.value.id,
      status: '0',
      size: MEMBER_PAGE_SIZE
    })
    if (gen !== pendingModGen) return
    pendingModCount.value = res.data?.members?.length || 0
    pendingModFull.value = pendingModCount.value >= MEMBER_PAGE_SIZE
  } catch {
    if (gen !== pendingModGen) return
    pendingModCount.value = 0
    pendingModFull.value = false
  }
}

// 无限滚动
const hotSentinel = ref(null)
const newSentinel = ref(null)
const topSentinel = ref(null)

const sentinelRefMap = { hot: hotSentinel, new: newSentinel, top: topSentinel }
let observers = []

const setupObservers = () => {
  observers.forEach(o => o.disconnect())
  observers = []

  Object.keys(sentinelRefMap).forEach(tab => {
    const el = sentinelRefMap[tab].value
    if (!el) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const state = tabStateMap[tab]
        if (state.hasMore.value && !state.loading.value) {
          fetchPosts(tab, true)
        }
      }
    }, { rootMargin: '200px' })

    observer.observe(el)
    observers.push(observer)
  })
}

onMounted(async () => {
  await fetchCircleDetail()
  fetchPosts(activeTab.value)
  setupObservers()
})

// 路由参数变化时（同组件复用，例如从 /circle/A 跳到 /circle/B）重新加载圈子数据。
// 否则 onMounted 不会再次执行，URL 变了但页面仍是上一个圈子的内容。
watch(() => route.params.id, async (newId, oldId) => {
  if (!newId || newId === oldId) return

  // 立即显示骨架，遮住上一个圈子的内容
  loading.value = true

  // 重置上一个圈子的帖子相关状态，避免残留数据
  activeTab.value = 'hot'
  categoryName.value = ''
  hotPosts.value = []
  newPosts.value = []
  topPosts.value = []
  hotSearchAfter.value = ''
  newSearchAfter.value = ''
  topSearchAfter.value = ''
  hotHasMore.value = true
  newHasMore.value = true
  topHasMore.value = true
  pendingModCount.value = 0
  pendingModFull.value = false

  await fetchCircleDetail()
  fetchPosts(activeTab.value)
  setupObservers()
})

onUnmounted(() => {
  observers.forEach(o => o.disconnect())
})
</script>

<style scoped>
.circle-detail-page {
  min-height: 100vh;
  position: relative;
}

.main-content {
  margin-top: var(--header-height);
  min-height: calc(100vh - var(--header-height));
  transition: margin-left 0.3s ease, width 0.3s ease;
}

/* 圈子头部 */
.circle-header {
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 32px 24px;
  color: white;
}

.header-overlay {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.circle-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.circle-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  object-fit: cover;
  flex-shrink: 0;
}

.circle-avatar-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  /* background: linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%); */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: bold;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.circle-info {
  flex: 1;
  min-width: 0;
}

.circle-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.circle-slug {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
  font-weight: 400;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 内容容器：包含帖子列表和右侧信息栏 */
.content-container {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: center;
  padding: 24px;
}

/* 帖子区域 */
.posts-section {
  width: 55dvw;
}

.posts-list {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-state p {
  font-size: 1rem;
}

.load-sentinel {
  height: 1px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

/* 右侧信息栏 - 在内容容器内 */
.right-sidebar-header {
  width: 384px;
  flex-shrink: 0;
  position: sticky;
  top: calc(var(--header-height) + 24px);
  max-height: calc(100vh - var(--header-height) - 24px);
  overflow-y: auto;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.right-sidebar-header::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.sidebar-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.card-body {
  padding: 20px;
}

/* 管理按钮上的待审核数量角标 */
.manage-badge {
  min-width: 18px;
  margin-left: 4px;
  padding: 0 5px;
  border-radius: 9px;
  background: rgba(255, 90, 90, 0.9);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
}

/* 统计数据 */
.circle-stats-sidebar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.circle-stats-sidebar .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.mid-con{
  /* margin-left: 0%; */
  width: auto;
  /* max-width: 85%; */
}
.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

/* 描述和规则 */
.section-title {
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.description-section {
  margin-bottom: 16px;
}

.show-more-btn {
  margin-top: 8px;
  font-size: 0.8rem;
  color: rgb(155, 255, 182);
  cursor: pointer;
  transition: color 0.2s ease;
  user-select: none;
}

.show-more-btn:hover {
  color: rgba(255, 255, 255, 0.9);
}

.description {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.rules-section {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.rules {
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  font-size: 0.85rem;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.circle-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.info-row .value {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: right;
}

.member-info {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.member-info h4 {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

/* NaiveUI 样式覆盖 */
:deep(.n-tabs) {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 8px;
}

:deep(.n-tab-pane) {
  padding: 16px 0;
}

/* 响应式 */
@media (max-width: 1400px) {
  .right-sidebar-header {
    width: 320px;
  }
}

@media (max-width: 1200px) {
  .right-sidebar-header {
    display: none;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 16px;
  }

  .content-container {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .circle-avatar-wrapper {
    width: 100%;
  }

  .action-buttons {
    width: 100%;
    flex-wrap: wrap;
  }

  .action-buttons button {
    flex: 1;
    min-width: 0;
  }

  .circle-name {
    font-size: 1.5rem;
  }

  .circle-stats-sidebar {
    gap: 12px;
  }
}

/* ===== 切换圈子时的加载骨架 ===== */
/* 容器不加 padding/max-width：头部 banner 需要全宽，与真实 .circle-header 一致；内容由 .sk-content 自行居中 */

/* 头部 banner：全宽、无圆角/边框，cover 占满整块（对齐真实 .circle-header） */
.sk-header {
  position: relative;
  padding: 32px 24px;
  background: linear-gradient(90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.10) 37%,
    rgba(255, 255, 255, 0.04) 63%);
  background-size: 400% 100%;
  animation: cd-skel-shimmer 1.4s ease infinite;
}

/* 头部内容：max-width 900px 居中，对齐真实 .header-overlay */
.sk-header-overlay {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
}

/* 头像占位：实色 + 白边，压在 shimmer banner 上可辨（边框对齐真实 .circle-avatar） */
.sk-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.18);
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.sk-title-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 头部标题占位：实色，确保在 shimmer banner 上可辨 */
.sk-hline {
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.22);
}

.sk-hline--title {
  width: 220px;
  height: 22px;
}

.sk-hline--sub {
  width: 120px;
  height: 14px;
  background: rgba(255, 255, 255, 0.14);
}

/* 内容区：居中容器，对齐真实 .content-container */
.sk-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: center;
  padding: 24px;
}

.sk-posts {
  width: 55dvw;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sk-tabs {
  height: 36px;
  border-radius: 8px;
}

.sk-post-card {
  height: 120px;
  border-radius: 12px;
}

.sk-sidebar {
  width: 384px;
  flex-shrink: 0;
}

.sk-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}

/* 骨架通用 shimmer 外观（内容区的卡片/线条/标签） */
.sk-line,
.sk-tabs,
.sk-post-card {
  background: linear-gradient(90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.12) 37%,
    rgba(255, 255, 255, 0.05) 63%);
  background-size: 400% 100%;
  animation: cd-skel-shimmer 1.4s ease infinite;
}

.sk-line {
  height: 14px;
  border-radius: 6px;
}

.sk-line--card-title {
  width: 140px;
  height: 18px;
}

.sk-line--full {
  width: 100%;
}

.sk-line--short {
  width: 60%;
}

@keyframes cd-skel-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

/* 骨架响应式：与真实布局断点保持一致 */
@media (max-width: 1400px) {
  .sk-sidebar {
    width: 320px;
  }
}

@media (max-width: 1200px) {
  .sk-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .sk-content {
    padding: 16px;
  }

  .sk-posts {
    width: 100%;
  }
}
</style>
