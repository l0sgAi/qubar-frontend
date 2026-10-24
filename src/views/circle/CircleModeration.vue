<template>
  <div class="circle-moderation-page">
    <!-- 顶栏 -->
    <AppHeader />

    <!-- 侧边栏 -->
    <SideNav @collapsed="offset = 64" @expanded="offset = 260" />

    <!-- 主内容区域 -->
    <div class="main-content" :style="{ 'margin-left': `${offset}px`, width: `calc(100% - ${offset}px)` }">
      <!-- 页面级加载骨架 -->
      <div v-if="pageLoading" class="page-skeleton">
        <div class="sk-brief">
          <div class="sk-avatar"></div>
          <div class="sk-lines">
            <div class="sk-line sk-line--title"></div>
            <div class="sk-line sk-line--sub"></div>
          </div>
        </div>
        <div class="sk-tabs"></div>
        <div class="sk-row" v-for="n in 3" :key="n"></div>
      </div>

      <template v-else>
        <!-- 管理页共享页头：返回 + 圈子信息 + 角色 + 成员管理/编辑资料/内容审核切换（含角标） -->
        <CircleAdminHeader ref="adminHeaderRef" active="moderation" :circle="circle" />

        <!-- 审核队列子 Tab：被举报帖子（#31，默认）/ 待审帖子（#30）；新队列在 tabDefs / QUEUES 中追加一项即可 -->
        <div class="moderation-panel">
          <NTabs v-model:value="activeTab" type="line" animated size="large">
            <NTabPane v-for="tab in tabDefs" :key="tab.key" :name="tab.key" display-directive="show:lazy">
              <template #tab>
                <span class="tab-label">
                  <span>{{ tab.label }}</span>
                  <span v-if="tabBadge(tab.key)" class="tab-badge">{{ tabBadge(tab.key) }}</span>
                </span>
              </template>

              <div class="post-list">
                <NEmpty
                  v-if="!tabState[tab.key].loading && tabState[tab.key].posts.length === 0"
                  :description="tab.empty"
                  class="list-empty"
                />

                <ModerationPostItem v-for="p in tabState[tab.key].posts" :key="p.id" :post="p">
                  <template v-if="tab.key === 'reported'" #badges>
                    <NTag v-if="p.status === POST_STATUS.BLOCKED" size="small" round type="warning" class="hidden-tag">
                      {{ t('circle.moderation.reported.autoHidden') }}
                    </NTag>
                  </template>
                  <template v-if="tab.key === 'reported'" #extra>
                    <ModerationReportSummary :post="p" />
                  </template>
                  <template #actions>
                    <!-- 左侧为破坏性动作（驳回 / 下架），右侧为主动作（通过 / 保留），主动作按钮承载 loading -->
                    <NButton
                      size="small"
                      quaternary
                      round
                      type="error"
                      :disabled="actingId !== ''"
                      @click="openAction(p, tab.actions[0])"
                    >
                      {{ t(ACTION_DEFS[tab.actions[0]].button) }}
                    </NButton>
                    <NButton
                      size="small"
                      type="primary"
                      round
                      :disabled="actingId !== '' && actingId !== p.id"
                      :loading="actingId === p.id"
                      @click="openAction(p, tab.actions[1])"
                    >
                      {{ t(ACTION_DEFS[tab.actions[1]].button) }}
                    </NButton>
                  </template>
                </ModerationPostItem>

                <!-- 首次加载骨架 / 追加翻页 spinner / 加载更多 / 到底 -->
                <div v-if="tabState[tab.key].loading && tabState[tab.key].posts.length === 0" class="list-skeleton">
                  <div class="sk-row" v-for="n in 3" :key="n"></div>
                </div>
                <div v-else-if="tabState[tab.key].loading" class="loading-state">
                  <NSpin size="small" />
                </div>
                <div v-else-if="tabState[tab.key].hasMore && tabState[tab.key].posts.length > 0" class="list-footer">
                  <NButton size="small" quaternary round @click="loadTab(tab.key)">
                    {{ t('common.loadMore') }}
                  </NButton>
                </div>
                <div v-else-if="tabState[tab.key].posts.length > 0" class="list-footer">
                  {{ t('common.noMore') }}
                </div>

                <div :ref="setSentinel(tab.key)" class="load-sentinel"></div>
              </div>
            </NTabPane>
          </NTabs>
        </div>
      </template>
    </div>

    <!-- 处理确认弹窗（通过 / 驳回 / 保留 / 下架）：都可填备注（仅记入审核日志，不展示给作者） -->
    <NModal
      v-model:show="reviewVisible"
      preset="card"
      :title="t(reviewDef.title)"
      :style="{ width: '460px' }"
      :mask-closable="!reviewSubmitting"
      :closable="!reviewSubmitting"
    >
      <div class="review-body">
        <p class="review-target">
          {{ t(reviewDef.content, { title: reviewPost?.title || t('circle.moderation.untitled') }) }}
        </p>
        <div class="field-label">{{ t('circle.moderation.confirm.reasonLabel') }}</div>
        <NInput
          v-model:value="reviewReason"
          type="textarea"
          :maxlength="REVIEW_REASON_MAX"
          show-count
          :autosize="{ minRows: 3, maxRows: 6 }"
          :placeholder="t('circle.moderation.confirm.reasonPlaceholder')"
          :disabled="reviewSubmitting"
        />
        <p class="review-hint">{{ t('circle.moderation.confirm.reasonHint') }}</p>
      </div>
      <template #footer>
        <div class="review-footer">
          <NButton quaternary round :disabled="reviewSubmitting" @click="reviewVisible = false">
            {{ t('common.cancel') }}
          </NButton>
          <NButton
            :type="reviewDef.danger ? 'error' : 'primary'"
            round
            :loading="reviewSubmitting"
            class="review-confirm"
            @click="confirmReview"
          >
            {{ t(reviewDef.button) }}
          </NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton, NTabs, NTabPane, NSpin, NEmpty, NModal, NInput, NTag, useMessage
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/layout/AppHeader.vue'
import SideNav from '@/components/layout/SideNav.vue'
import CircleAdminHeader from '@/components/circle/CircleAdminHeader.vue'
import ModerationPostItem from '@/components/circle/ModerationPostItem.vue'
import ModerationReportSummary from '@/components/circle/ModerationReportSummary.vue'
import { getCircleDetail } from '@/api/circle'
import {
  getModerationPosts, reviewModerationPost, getModerationReports, resolveModerationReport
} from '@/api/moderation'
import { usePageTitle } from '@/composables/usePageTitle'
import { POST_STATUS } from '@/composables/usePostReview'
import { isManager } from '@/constants/circle'
import {
  REVIEW_ACTION, REVIEW_REASON_MAX, MODERATION_PAGE_SIZE, RESOLVE_ACTION
} from '@/constants/moderation'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const { setTitleData } = usePageTitle()

const offset = ref(260)
const circleId = computed(() => route.params.id)

// 圈子信息与我的角色（权限守卫依据）
const circle = ref({})

const pageLoading = ref(true)

// 审核队列定义：key → 列表接口 + 两个处理动作（[破坏性动作, 主动作]，见 ACTION_DEFS）。
// 后端默认 review_action=publish，AI 拿不准的帖子直接发布、靠举报兜底，所以「被举报」排第一且为默认 Tab
const QUEUES = {
  reported: { fetch: getModerationReports, actions: [RESOLVE_ACTION.REMOVE, RESOLVE_ACTION.DISMISS] },
  pending: { fetch: getModerationPosts, actions: [REVIEW_ACTION.REJECT, REVIEW_ACTION.APPROVE] }
}
const DEFAULT_TAB = 'reported'
const tabDefs = computed(() => [
  {
    key: 'reported',
    label: t('circle.moderation.tabs.reported'),
    empty: t('circle.moderation.reported.empty'),
    actions: QUEUES.reported.actions
  },
  {
    key: 'pending',
    label: t('circle.moderation.tabs.pending'),
    empty: t('circle.moderation.empty'),
    actions: QUEUES.pending.actions
  }
])
const LOAD_FAILED = {
  reported: 'circle.moderation.reported.loadFailed',
  pending: 'circle.moderation.loadFailed'
}

// 支持 ?tab= 定位子 Tab（通知跳转用，如 ?tab=reported），非法值回落默认 Tab
const resolveTab = (tab) => (typeof tab === 'string' && tab in QUEUES ? tab : DEFAULT_TAB)
// URL 显式指定了合法 Tab 时不做「被举报为空 → 自动切到待审」
const hasTabQuery = () => typeof route.query.tab === 'string' && route.query.tab in QUEUES
const activeTab = ref(resolveTab(route.query.tab))

const emptyTabState = () => ({ posts: [], cursor: '', hasMore: true, loading: false, loaded: false })
const tabState = reactive(Object.fromEntries(Object.keys(QUEUES).map(k => [k, emptyTabState()])))

// 加载世代：刷新 Tab 后旧请求的响应直接丢弃，防止覆盖新列表
const genMap = Object.fromEntries(Object.keys(QUEUES).map(k => [k, 0]))

const loadTab = async (key, isRefresh = false) => {
  const state = tabState[key]
  if (!isRefresh && (state.loading || !state.hasMore)) return

  const gen = ++genMap[key]
  state.loading = true
  let succeeded = false
  const params = { circle_id: circleId.value, size: MODERATION_PAGE_SIZE }
  if (!isRefresh && state.cursor) {
    params.cursor = state.cursor
  }
  try {
    const res = await QUEUES[key].fetch(params)
    if (gen !== genMap[key]) return // 过期响应丢弃
    const items = res.data?.posts || []
    state.posts = isRefresh ? items : [...state.posts, ...items]
    // 空字符串游标 = 没有更多页
    state.cursor = res.data?.cursor || ''
    state.hasMore = state.cursor !== ''
    state.loaded = true
    succeeded = true
  } catch (error) {
    if (gen !== genMap[key]) return
    console.error('加载审核队列失败:', error)
    if (error?.code === 201 && params.cursor) {
      // 游标失效（Invalid cursor）：从首页重拉；新请求接管 loading，本次 finally 因世代过期不再改状态
      reloadTab(key)
      return
    }
    if (error?.code === 203) {
      handleNoPermission()
      return
    }
    message.error(t(LOAD_FAILED[key]))
  } finally {
    if (gen === genMap[key]) {
      state.loading = false
      // 仅成功后才挂观察器：失败时触发器常驻视口会造成无限自动重试（失败后靠「加载更多」手动重试）
      if (succeeded && state.hasMore) {
        await nextTick()
        ensureObserver(key)
      }
    }
  }
}

// 就地刷新某个 Tab（回到第一页）：先自增世代使在途请求过期
const reloadTab = async (key) => {
  genMap[key]++
  tabState[key].cursor = ''
  tabState[key].hasMore = true
  await loadTab(key, true)
}

// 共享页头（含内容审核角标），处理后经 ref 同步角标
const adminHeaderRef = ref(null)

// 子 Tab 角标：两个队列在进页时各拉首页（size=20），满页（或已翻过页）显示「20+」，处理后随本地移除递减
const tabBadge = (key) => {
  const state = tabState[key]
  if (!state.loaded) return ''
  if (state.hasMore || state.posts.length >= MODERATION_PAGE_SIZE) return t('circle.manage.badgeFull')
  return state.posts.length || ''
}

// 切 Tab：同步 ?tab=，没加载过的 Tab 拉首页；已在后台加载过的 Tab 面板此时才挂载，补挂无限滚动观察器
watch(activeTab, async (key) => {
  if (route.query.tab !== key) {
    router.replace({ query: { ...route.query, tab: key } })
  }
  if (!tabState[key].loaded) {
    if (!tabState[key].loading) loadTab(key, true)
    return
  }
  if (tabState[key].hasMore) {
    await nextTick()
    ensureObserver(key)
  }
})

// 无限滚动：每个 Tab 独立哨兵；隐藏面板内的哨兵不会进入视口，互不干扰
const sentinelEls = {}
const observers = {}

const setSentinel = (key) => (el) => {
  if (el) sentinelEls[key] = el
  else delete sentinelEls[key]
}

const ensureObserver = (key) => {
  if (observers[key] || !sentinelEls[key]) return
  observers[key] = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      const state = tabState[key]
      if (state.hasMore && !state.loading) {
        loadTab(key)
      }
    }
  }, { rootMargin: '200px' })
  observers[key].observe(sentinelEls[key])
}

const cleanupObservers = () => {
  Object.values(observers).forEach(o => o.disconnect())
  Object.keys(observers).forEach(k => delete observers[k])
}

// ---------- 权限 ----------

const refreshRoleAndGuard = async () => {
  try {
    const res = await getCircleDetail(circleId.value)
    if (res.data) circle.value = res.data
    if (!isManager(circle.value.member_role)) {
      message.warning(t('circle.manage.error.roleDemoted'))
      router.replace(`/circle/${circleId.value}`)
    }
  } catch {
    // 详情拉取失败不打断当前页
  }
}

// 403：提示无权限并重查角色。两个队列同时加载可能同时 403，重查进行中时不重复提示
let guarding = null
const handleNoPermission = () => {
  if (guarding) return
  message.error(t('circle.moderation.error.noPermission'))
  guarding = refreshRoleAndGuard().finally(() => { guarding = null })
}

// ---------- 处理：通过 / 驳回（待审）、保留 / 下架（被举报） ----------

// 动作 → 所属队列、提交接口、弹窗与按钮文案、成功提示
const ACTION_DEFS = {
  [REVIEW_ACTION.APPROVE]: {
    queue: 'pending',
    submit: reviewModerationPost,
    title: 'circle.moderation.confirm.approveTitle',
    content: 'circle.moderation.confirm.approveContent',
    button: 'circle.moderation.actions.approve',
    success: () => t('circle.moderation.success.approved')
  },
  [REVIEW_ACTION.REJECT]: {
    queue: 'pending',
    submit: reviewModerationPost,
    danger: true,
    title: 'circle.moderation.confirm.rejectTitle',
    content: 'circle.moderation.confirm.rejectContent',
    button: 'circle.moderation.actions.reject',
    success: () => t('circle.moderation.success.rejected')
  },
  [RESOLVE_ACTION.DISMISS]: {
    queue: 'reported',
    submit: resolveModerationReport,
    title: 'circle.moderation.reported.confirm.keepTitle',
    content: 'circle.moderation.reported.confirm.keepContent',
    button: 'circle.moderation.reported.actions.keep',
    success: (data) => {
      const n = Number(data?.closed_reports) || 0
      return n === 1
        ? t('circle.moderation.reported.success.keptOne')
        : t('circle.moderation.reported.success.kept', { n })
    }
  },
  [RESOLVE_ACTION.REMOVE]: {
    queue: 'reported',
    submit: resolveModerationReport,
    danger: true,
    title: 'circle.moderation.reported.confirm.removeTitle',
    content: 'circle.moderation.reported.confirm.removeContent',
    button: 'circle.moderation.reported.actions.remove',
    success: () => t('circle.moderation.reported.success.removed')
  }
}

const actingId = ref('')
const reviewVisible = ref(false)
const reviewSubmitting = ref(false)
const reviewPost = ref(null)
const reviewAction = ref(REVIEW_ACTION.APPROVE)
const reviewReason = ref('')
const reviewDef = computed(() => ACTION_DEFS[reviewAction.value])

const openAction = (post, action) => {
  if (actingId.value) return
  reviewPost.value = post
  reviewAction.value = action
  reviewReason.value = ''
  reviewVisible.value = true
}

// 成功后本地移除该条：游标指向已加载的最后一条之后，移除不影响翻页；删空了但还有下一页时主动续拉
const removeLocal = (key, postId) => {
  const state = tabState[key]
  state.posts = state.posts.filter(p => p.id !== postId)
  if (state.posts.length === 0 && state.hasMore) {
    loadTab(key)
  }
}

// 按 error.code 渲染自有文案，不展示后端英文 message；202 未登录已由 axios 拦截器统一处理
const handleReviewError = (error, key) => {
  const code = error?.code
  if (code === 204) {
    // 帖子已被他人（或 AI worker）处理 / 已删除 / 不在本圈 / 已没有待处理举报 → 刷新列表
    message.warning(t('circle.moderation.error.handled'))
    reloadTab(key)
    adminHeaderRef.value?.refreshModerationBadge()
    return
  }
  if (code === 203) {
    handleNoPermission()
    return
  }
  if (code === 201) {
    message.error(t('circle.moderation.error.badRequest'))
    return
  }
  message.error(t('circle.moderation.error.generic'))
}

const confirmReview = async () => {
  const post = reviewPost.value
  if (!post || reviewSubmitting.value) return
  const action = reviewAction.value
  const def = ACTION_DEFS[action]
  reviewSubmitting.value = true
  actingId.value = post.id
  try {
    const payload = { circle_id: circleId.value, post_id: post.id, action }
    const reason = reviewReason.value.trim()
    if (reason) payload.reason = reason.slice(0, REVIEW_REASON_MAX)
    const res = await def.submit(payload)
    message.success(def.success(res?.data))
    reviewVisible.value = false
    removeLocal(def.queue, post.id)
    adminHeaderRef.value?.refreshModerationBadge()
  } catch (error) {
    reviewVisible.value = false
    handleReviewError(error, def.queue)
  } finally {
    reviewSubmitting.value = false
    actingId.value = ''
  }
}

// ---------- 初始化 ----------

const initPage = async () => {
  pageLoading.value = true
  try {
    const res = await getCircleDetail(circleId.value)
    circle.value = res.data || {}
    // 页面内自查角色：非管理侧不发列表请求，直接退回详情页
    if (!isManager(circle.value.member_role)) {
      message.error(t('circle.moderation.noPermissionVisit'))
      router.replace(`/circle/${circleId.value}`)
      return
    }
    if (circle.value.name) {
      setTitleData('title.circleModerationName', { name: circle.value.name })
    }
    // 先渲染列表面板（哨兵元素就位），再发首页请求，成功后才能挂上观察器。
    // 两个队列同时拉首页：既是各自 Tab 的角标，也用于下面的默认 Tab 判断
    pageLoading.value = false
    await nextTick()
    const autoSwitch = !hasTabQuery()
    await Promise.all(Object.keys(QUEUES).map(key => loadTab(key, true)))
    // 未指定 ?tab= 时：被举报为空、待审有数据 → 自动切到待审（用户已手动切过则不动）
    const reported = tabState.reported
    if (autoSwitch && activeTab.value === DEFAULT_TAB && reported.loaded && reported.posts.length === 0 &&
      !reported.hasMore && tabState.pending.posts.length > 0) {
      activeTab.value = 'pending'
    }
  } catch (error) {
    console.error('加载圈子信息失败:', error)
    message.error(t('messages.getDetailFailed', { error: error.message || t('common.unknownError') }))
    router.replace(`/circle/${circleId.value}`)
  } finally {
    pageLoading.value = false
  }
}

onMounted(initPage)

// 同组件复用（/circle/A/moderation → /circle/B/moderation）时整体重置；
// 页头组件随 pageLoading 切换卸载重建，角标由其 onMounted 重新拉取
watch(() => route.params.id, (newId, oldId) => {
  if (!newId || newId === oldId) return
  cleanupObservers()
  circle.value = {}
  reviewVisible.value = false
  Object.keys(tabState).forEach((key) => {
    tabState[key] = emptyTabState()
    // 同时作废上一个圈子仍在途的 loadTab，防止旧响应通过世代校验后写回新列表
    genMap[key]++
  })
  initPage()
})

onUnmounted(cleanupObservers)
</script>

<style scoped>
.circle-moderation-page {
  min-height: 100vh;
  position: relative;
}

.main-content {
  margin-top: var(--header-height);
  min-height: calc(100vh - var(--header-height));
  padding: 24px;
  transition: margin-left 0.3s ease, width 0.3s ease;
}

.moderation-panel {
  max-width: 900px;
  margin: 20px auto 0;
  padding: 4px 20px 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 8px;
}

.list-empty {
  padding: 48px 0;
}

.list-footer {
  display: flex;
  justify-content: center;
  padding: 6px 0 2px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.load-sentinel {
  height: 1px;
}

/* 子 Tab 标签 + 待处理数角标（与页头 seg 角标同款） */
.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tab-badge {
  min-width: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: rgba(255, 90, 90, 0.9);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
}

.hidden-tag {
  flex-shrink: 0;
}

/* 骨架屏：页面级骨架占满内容区宽度；列表内骨架铺满面板 */
.page-skeleton {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-skeleton {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sk-brief {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
}

.sk-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.sk-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sk-line {
  height: 14px;
  border-radius: 7px;
}

.sk-line--title {
  width: 30%;
}

.sk-line--sub {
  width: 45%;
}

.sk-tabs {
  height: 40px;
  border-radius: 10px;
  margin-top: 20px;
}

.sk-row {
  height: 180px;
  border-radius: 14px;
}

.sk-avatar,
.sk-line,
.sk-tabs,
.sk-row {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: moderation-shimmer 1.5s ease-in-out infinite;
}

@keyframes moderation-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 审核弹窗内部布局（自身 DOM 带 scoped 属性，scoped 样式可命中；
   弹窗外壳的暗色皮肤由全局 main.css 统一提供） */
.review-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-target {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.6;
  word-break: break-word;
}

.field-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.review-hint {
  margin: 0;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.45);
}

.review-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
