import { ref } from 'vue'
import { getMyInvites } from '@/api/circleInvite'
import { auth } from '@/utils/auth'

// 待接受的圈子邀请数（侧栏 / TabBar / 个人中心入口共用的模块级单例）。
// 后端不发邮件也没有站内通知（l0sgAi/qubar#169），这个角标是被邀请人知道自己被邀请的唯一途径。
// 用 GET /circle/invite/my?size=1 的 total 计数；页面切换时各入口重新挂载，
// 只在超过 REFRESH_INTERVAL 或显式 force 时才真正请求。

const REFRESH_INTERVAL = 60 * 1000

const pendingCount = ref(0)
let lastFetched = 0
let inflight = null

/** 拉取待接受邀请数；未登录时归零且不请求。失败静默（角标不是关键路径）。 */
export async function refreshPendingInvites({ force = false } = {}) {
  if (!auth.isAuthenticated()) {
    pendingCount.value = 0
    return 0
  }
  if (!force && inflight) return inflight
  if (!force && lastFetched && Date.now() - lastFetched < REFRESH_INTERVAL) return pendingCount.value
  inflight = getMyInvites({ page: 1, size: 1 })
    .then((res) => {
      pendingCount.value = Number(res.total) || 0
      lastFetched = Date.now()
      return pendingCount.value
    })
    .catch(() => pendingCount.value)
    .finally(() => { inflight = null })
  return inflight
}

/** 「我的邀请」页拿到完整列表后直接回写总数，免一次请求 */
export function setPendingInvites(count) {
  pendingCount.value = Math.max(0, Number(count) || 0)
  lastFetched = Date.now()
}

export function usePendingInvites() {
  return { pendingCount, refreshPendingInvites, setPendingInvites }
}

// 仅供单测重置模块状态
export function __resetPendingInvites() {
  pendingCount.value = 0
  lastFetched = 0
  inflight = null
}
