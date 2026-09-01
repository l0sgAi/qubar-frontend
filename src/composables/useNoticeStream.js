import { ref } from 'vue'
import { auth } from '@/utils/auth'
import { getUnreadCount } from '@/api/notice'

// SSE 服务端地址（与 utils/request.js 的 axios baseURL 保持一致）
const API_BASE = 'https://api.qubar.site'
// 轮询降级间隔（对接文档建议 ≥30s）
const POLL_INTERVAL = 30000

/**
 * 未读通知数实时推送（SSE 主通道 + 30s 轮询降级）。
 * 对接文档：docs/notice-stream-frontend-api.md（后端 qubar 仓）。
 *
 * 行为要点：
 * - 建连即推全量未读数，之后未读数变化才推；收到直接全量替换，不做加减
 * - 断线由浏览器 EventSource 按服务端 retry:5000 自动重连，不自建重连逻辑
 * - 建连被拒（401/429）→ readyState=CLOSED → 回落 30s 轮询
 *   （EventSource 拿不到 HTTP 状态码；若真 401，轮询请求会被 axios 拦截器清 token 跳登录）
 * - 收到 auth-expired（登出/过期/被踢下线）→ 主动 close（防自动重连 401 死循环）
 *   → 清 token → 回调 onAuthExpired 由调用方跳转登录页
 *
 * @param {Object} [options]
 * @param {Function} [options.onAuthExpired] - 登录态失效回调（清 token 之后调用）
 * @returns {{ unreadCount: Ref<number>, start: Function, stop: Function }}
 */
export function useNoticeStream({ onAuthExpired } = {}) {
  const unreadCount = ref(0)
  let es = null
  let pollingTimer = null

  const fetchOnce = async () => {
    if (!auth.isAuthenticated()) return
    try {
      const res = await getUnreadCount()
      if (res.data) {
        unreadCount.value = res.data.unread_count || 0
      }
    } catch (error) {
      console.error('获取未读通知数失败:', error)
    }
  }

  const startPolling = () => {
    if (pollingTimer) return
    pollingTimer = setInterval(fetchOnce, POLL_INTERVAL)
    fetchOnce()
  }

  const stopPolling = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  const closeEs = () => {
    if (es) {
      es.close()
      es = null
    }
  }

  const connect = () => {
    const token = auth.getToken()
    if (!token) {
      startPolling()
      return
    }
    // EventSource 不能自定义 header，token 走 query（后端 header→query 兜底鉴权）
    es = new EventSource(`${API_BASE}/notice/stream?satoken=${encodeURIComponent(token)}`)

    es.addEventListener('unread-count', (e) => {
      try {
        const data = JSON.parse(e.data)
        unreadCount.value = data.unread_count ?? 0
      } catch {
        // 坏帧忽略，下一帧覆盖
      }
    })

    es.addEventListener('auth-expired', () => {
      closeEs()
      auth.clearToken()
      if (onAuthExpired) onAuthExpired()
    })

    // 建连成功 → 停轮询（两通道互备不互斥）
    es.onopen = () => stopPolling()

    es.onerror = () => {
      // CONNECTING：网络抖动，浏览器自动重连中，不干预
      if (es && es.readyState === EventSource.CLOSED) {
        closeEs()
        startPolling()
      }
    }
  }

  /** 启动（幂等）。未登录为空操作。 */
  const start = () => {
    if (es || pollingTimer) return
    if (!auth.isAuthenticated()) return
    connect()
  }

  /** 停止并释放（组件卸载/登出时调用）。 */
  const stop = () => {
    closeEs()
    stopPolling()
  }

  return { unreadCount, start, stop }
}
