import { describe, it, expect, vi, beforeEach } from 'vitest'

const api = vi.hoisted(() => ({ getMyInvites: null }))
const authState = vi.hoisted(() => ({ loggedIn: true }))

vi.mock('@/api/circleInvite', () => ({ getMyInvites: (...a) => api.getMyInvites(...a) }))
vi.mock('@/utils/auth', () => ({ auth: { isAuthenticated: () => authState.loggedIn } }))

const {
  usePendingInvites, refreshPendingInvites, setPendingInvites, __resetPendingInvites
} = await import('@/composables/usePendingInvites')

beforeEach(() => {
  __resetPendingInvites()
  authState.loggedIn = true
  api.getMyInvites = vi.fn(() => Promise.resolve({ data: [{}], total: 3 }))
})

describe('usePendingInvites', () => {
  it('用 size=1 的 total 计数', async () => {
    const { pendingCount } = usePendingInvites()
    await refreshPendingInvites()
    expect(api.getMyInvites).toHaveBeenCalledWith({ page: 1, size: 1 })
    expect(pendingCount.value).toBe(3)
  })

  it('未登录归零且不请求', async () => {
    setPendingInvites(5)
    authState.loggedIn = false
    await refreshPendingInvites({ force: true })
    expect(api.getMyInvites).not.toHaveBeenCalled()
    expect(usePendingInvites().pendingCount.value).toBe(0)
  })

  it('刷新间隔内复用缓存，force 时重新请求', async () => {
    await refreshPendingInvites()
    await refreshPendingInvites()
    expect(api.getMyInvites).toHaveBeenCalledTimes(1)
    api.getMyInvites = vi.fn(() => Promise.resolve({ data: [], total: 0 }))
    await refreshPendingInvites({ force: true })
    expect(api.getMyInvites).toHaveBeenCalledTimes(1)
    expect(usePendingInvites().pendingCount.value).toBe(0)
  })

  it('并发调用合并为一次请求', async () => {
    await Promise.all([refreshPendingInvites(), refreshPendingInvites()])
    expect(api.getMyInvites).toHaveBeenCalledTimes(1)
  })

  it('请求失败保持原值', async () => {
    setPendingInvites(2)
    api.getMyInvites = vi.fn(() => Promise.reject(new Error('Network Error')))
    await refreshPendingInvites({ force: true })
    expect(usePendingInvites().pendingCount.value).toBe(2)
  })
})
