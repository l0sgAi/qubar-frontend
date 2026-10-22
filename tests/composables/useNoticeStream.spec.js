import { describe, it, expect, vi, beforeEach } from 'vitest'

const api = vi.hoisted(() => ({ getUnreadCount: null }))
vi.mock('@/api/notice', () => ({
  getUnreadCount: (...args) => api.getUnreadCount(...args)
}))

const { useNoticeStream } = await import('@/composables/useNoticeStream')

const POLL_INTERVAL = 30000

// 最小 EventSource 替身：记录实例，可手动派发命名事件 / onopen / onerror
class FakeEventSource {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSED = 2
  static instances = []

  constructor(url) {
    this.url = url
    this.readyState = FakeEventSource.CONNECTING
    this.listeners = {}
    this.onopen = null
    this.onerror = null
    this.close = vi.fn(() => { this.readyState = FakeEventSource.CLOSED })
    FakeEventSource.instances.push(this)
  }

  addEventListener(type, fn) {
    (this.listeners[type] ||= []).push(fn)
  }

  emit(type, data) {
    (this.listeners[type] || []).forEach(fn => fn({ data }))
  }
}

const lastEs = () => FakeEventSource.instances[FakeEventSource.instances.length - 1]

const login = () => {
  localStorage.setItem('qubar_token', 'tok-123')
  localStorage.setItem('qubar_token_expire', String(Date.now() + 3600_000))
}

describe('composables/useNoticeStream', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    FakeEventSource.instances = []
    vi.stubGlobal('EventSource', FakeEventSource)
    api.getUnreadCount = vi.fn().mockResolvedValue({ data: { unread_count: 7 } })
  })

  it('未登录时 start 为空操作', () => {
    const { start } = useNoticeStream()
    start()
    expect(FakeEventSource.instances).toHaveLength(0)
    expect(api.getUnreadCount).not.toHaveBeenCalled()
  })

  it('登录后建立 SSE（token 走 query），unread-count 全量替换，坏帧忽略', () => {
    login()
    const { start, unreadCount } = useNoticeStream()
    start()
    start() // 幂等
    expect(FakeEventSource.instances).toHaveLength(1)
    expect(lastEs().url).toContain('/notice/stream?satoken=tok-123')

    lastEs().emit('unread-count', JSON.stringify({ unread_count: 3 }))
    expect(unreadCount.value).toBe(3)
    lastEs().emit('unread-count', '{bad json')
    expect(unreadCount.value).toBe(3)
    lastEs().emit('unread-count', JSON.stringify({}))
    expect(unreadCount.value).toBe(0)
  })

  it('conn-evicted：主动 close 阻止自动重连，回落 30s 轮询，不再重建 SSE', async () => {
    login()
    const { start, unreadCount } = useNoticeStream()
    start()
    const es = lastEs()

    es.emit('conn-evicted')
    expect(es.close).toHaveBeenCalledTimes(1)
    expect(es.readyState).toBe(FakeEventSource.CLOSED)

    // 立即拉一次，之后每 30s 一次
    await vi.advanceTimersByTimeAsync(0)
    expect(api.getUnreadCount).toHaveBeenCalledTimes(1)
    expect(unreadCount.value).toBe(7)
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL * 2)
    expect(api.getUnreadCount).toHaveBeenCalledTimes(3)

    // 被挤掉后 start 仍幂等：不会新建连接去挤别的标签页
    start()
    expect(FakeEventSource.instances).toHaveLength(1)
  })

  it('网络抖动（CONNECTING）交给浏览器自动重连，不关连接、不开轮询', async () => {
    login()
    const { start } = useNoticeStream()
    start()
    const es = lastEs()
    es.readyState = FakeEventSource.CONNECTING
    es.onerror()
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL)
    expect(es.close).not.toHaveBeenCalled()
    expect(api.getUnreadCount).not.toHaveBeenCalled()
  })

  it('建连彻底失败（CLOSED）回落轮询；onopen 停止轮询', async () => {
    login()
    const { start } = useNoticeStream()
    start()
    const es = lastEs()
    es.readyState = FakeEventSource.CLOSED
    es.onerror()
    await vi.advanceTimersByTimeAsync(0)
    expect(api.getUnreadCount).toHaveBeenCalledTimes(1)

    es.onopen()
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL * 2)
    expect(api.getUnreadCount).toHaveBeenCalledTimes(1)
  })

  it('auth-expired：close、清 token、回调调用方', () => {
    login()
    const onAuthExpired = vi.fn()
    const { start } = useNoticeStream({ onAuthExpired })
    start()
    const es = lastEs()
    es.emit('auth-expired')
    expect(es.close).toHaveBeenCalled()
    expect(localStorage.getItem('qubar_token')).toBeNull()
    expect(onAuthExpired).toHaveBeenCalledTimes(1)
  })

  it('轮询中登录态失效则跳过请求；请求失败只记日志', async () => {
    login()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    api.getUnreadCount = vi.fn().mockRejectedValue(new Error('boom'))
    const { start } = useNoticeStream()
    start()
    lastEs().emit('conn-evicted')
    await vi.advanceTimersByTimeAsync(0)
    expect(console.error).toHaveBeenCalled()

    localStorage.removeItem('qubar_token')
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL)
    expect(api.getUnreadCount).toHaveBeenCalledTimes(1)
  })

  it('stop 关闭连接并停止轮询', async () => {
    login()
    const { start, stop } = useNoticeStream()
    start()
    const es = lastEs()
    stop()
    expect(es.close).toHaveBeenCalled()

    start()
    lastEs().emit('conn-evicted')
    await vi.advanceTimersByTimeAsync(0)
    stop()
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL * 2)
    expect(api.getUnreadCount).toHaveBeenCalledTimes(1)
  })
})
