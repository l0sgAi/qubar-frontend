import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/auth/Login.vue'
import { auth } from '@/utils/auth'
import { applyPageTitle } from '@/utils/pageTitle'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      // 登录页：标签页标题展示品牌标语（见 utils/pageTitle.js）
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/success',
      name: 'success',
      component: () => import('@/views/auth/Success.vue'),
      meta: { titleKey: 'title.success' }
    },
    {
      // 首页信息流：访客可读（hot tab），recommend/following tab 需登录
      path: '/home',
      name: 'home',
      component: () => import('@/views/feed/Home.vue'),
      meta: { titleKey: 'title.home' }
    },
    {
      // 热点页：访客可读（/trending 接口已开放 anonymous）
      path: '/hot',
      name: 'hot',
      component: () => import('@/views/feed/Hot.vue'),
      meta: { titleKey: 'title.hot' }
    },
    {
      // 发现页：可选登录，允许匿名访问（新用户落地页）
      path: '/discover',
      name: 'discover',
      component: () => import('@/views/feed/Discover.vue'),
      meta: { titleKey: 'title.discover' }
    },
    {
      path: '/create-post',
      name: 'create-post',
      component: () => import('@/views/post/CreatePost.vue'),
      meta: { requiresAuth: true, titleKey: 'title.createPost' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/user/UserProfile.vue'),
      meta: { requiresAuth: true, titleKey: 'title.profile' }
    },
    {
      // 用户公开主页：访客可读（/user/detail/:id 已开放 anonymous）
      path: '/user/:id',
      name: 'user-detail',
      component: () => import('@/views/user/UserDetail.vue'),
      meta: { titleKey: 'title.userDetail' }
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/auth/Terms.vue'),
      meta: { titleKey: 'title.terms' }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/auth/Privacy.vue'),
      meta: { titleKey: 'title.privacy' }
    },
    {
      // 搜索页：访客可读（/post/list /circle/list /user/search 已开放 anonymous）
      path: '/search',
      name: 'search',
      component: () => import('@/views/feed/SearchResults.vue'),
      meta: { titleKey: 'title.searchResults' }
    },
    {
      // 圈子详情：访客可读（/circle/detail/:id 已开放 anonymous）
      path: '/circle/:id',
      name: 'circle-detail',
      component: () => import('@/views/circle/CircleDetail.vue'),
      meta: { titleKey: 'title.circleDetail' }
    },
    {
      // 圈子成员管理：需登录；圈主/管理员（member_role>=20）校验在页面内自查（非管理角色 /circle/members 返回 403）
      // pageFade：与编辑资料互切时启用页面级淡入过渡（见 App.vue）
      path: '/circle/:id/members',
      name: 'circle-members',
      component: () => import('@/views/circle/CircleMembers.vue'),
      meta: { requiresAuth: true, pageFade: true, titleKey: 'title.circleMembers' }
    },
    {
      // 圈子资料编辑：需登录；圈主可改全部字段、管理员仅部分字段（页面内按 member_role 自查并按角色渲染）
      path: '/circle/:id/edit',
      name: 'circle-edit',
      component: () => import('@/views/circle/CircleEdit.vue'),
      meta: { requiresAuth: true, pageFade: true, titleKey: 'title.circleEdit' }
    },
    {
      // 圈子机器人管理：需登录；圈主/管理员校验以服务端为准（本期为占位页，Phase 2/3 落地真实管理 UI）
      path: '/circle/:id/agents',
      name: 'circle-agents',
      component: () => import('@/views/circle/CircleAgents.vue'),
      meta: { requiresAuth: true, pageFade: true, titleKey: 'title.circleAgents' }
    },
    {
      // 帖子详情：访客可读（/post/detail/:id 已开放 anonymous）
      path: '/post/:id',
      name: 'post-detail',
      component: () => import('@/views/post/PostDetail.vue'),
      meta: { titleKey: 'title.postDetail' }
    },
    {
      // 消息中心（站内通知）：需登录
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/Notifications.vue'),
      meta: { requiresAuth: true, titleKey: 'title.notifications' }
    },
    {
      // 机器人管理：需登录。管理员（role=1）页面内自查后见「全局机器人管理 + 可管理圈子」双 tab；
      // 普通用户仅见可管理圈子列表（圈子选择器），全局 /agent/* 接口非管理员返回 403
      path: '/admin/agents',
      name: 'admin-agents',
      component: () => import('@/views/admin/AdminAgents.vue'),
      meta: { requiresAuth: true, titleKey: 'title.adminAgents' }
    }
  ]
})

// 全局路由守卫
router.beforeEach((to, _, next) => {
  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    if (auth.isAuthenticated()) {
      // 已登录，允许访问
      next()
    } else {
      // 未登录，重定向到登录页
      next('/')
    }
  } else {
    // 不需要认证的路由，直接放行
    next()
  }
})

// 进入页面后同步浏览器标签页标题（含 i18n）
router.afterEach((to) => {
  applyPageTitle(to)
})

export default router
