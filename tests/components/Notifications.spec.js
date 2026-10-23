import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const api = vi.hoisted(() => ({ getNoticeList: null }))
vi.mock('@/api/notice', () => ({
  getNoticeList: (...args) => api.getNoticeList(...args),
  markNoticesRead: () => Promise.resolve(),
  markAllNoticesRead: () => Promise.resolve()
}))
vi.mock('@/composables/useAppShell', () => ({
  useAppShell: () => ({ offset: ref(0), contentStyle: {} })
}))
vi.mock('@/components/layout/AppShell.vue', () => ({ default: { render: () => null } }))
vi.mock('naive-ui', async (importOriginal) => ({
  ...(await importOriginal()),
  useMessage: () => ({ error: vi.fn(), success: vi.fn() })
}))

const { default: Notifications } = await import('@/views/Notifications.vue')
const { createTestI18n, createTestRouter } = await import('../helpers/plugins')

const NOTICES = [
  { id: 'n1', notice_type: 7, post_id: 'p1', snippet: '过审帖', is_read: false },
  { id: 'n2', notice_type: 8, post_id: 'p2', snippet: '驳回帖', is_read: true },
  { id: 'n3', notice_type: 1, post_id: 'p3', snippet: '被赞帖', is_read: true }
]

const mountPage = async () => {
  const router = createTestRouter([{ path: '/notifications' }, { path: '/post/:id' }])
  await router.push('/notifications')
  const wrapper = mount(Notifications, { global: { plugins: [router, createTestI18n()] } })
  await flushPromises()
  return wrapper
}

describe('Notifications', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} })
    api.getNoticeList = vi.fn(() => Promise.resolve({ data: { notices: NOTICES, cursor: '' } }))
  })

  it('7/8 渲染审核文案、系统图标头像，并链接到帖子详情', async () => {
    const wrapper = await mountPage()
    const items = wrapper.findAll('.notice-item')
    expect(items.map(el => el.find('.notice-text').text())).toEqual([
      '你的帖子《过审帖》已通过审核',
      '你的帖子《驳回帖》未通过审核',
      '有人 赞了你的帖子《被赞帖》'
    ])
    expect(items.map(el => el.attributes('href'))).toEqual(['/post/p1', '/post/p2', '/post/p3'])
    // 系统通知用图标头像，普通通知（actor 缺省）仍是首字母兜底
    expect(items[0].find('.system-avatar').exists()).toBe(true)
    expect(items[1].find('.system-avatar').exists()).toBe(true)
    expect(items[2].find('.system-avatar').exists()).toBe(false)
    expect(items[2].find('.notice-avatar').text()).toBe('有')
  })

  it('「审核」tab 只请求 7,8（9–11 在后端 #154 上线前会 400）', async () => {
    const wrapper = await mountPage()
    const reviewTab = wrapper.findAll('.notice-tab').find(el => el.text() === '审核')
    await reviewTab.trigger('click')
    await flushPromises()
    expect(api.getNoticeList).toHaveBeenLastCalledWith({ type: '7,8', size: 20 })
    for (const [params] of api.getNoticeList.mock.calls) {
      expect(String(params.type)).not.toMatch(/9|10|11/)
    }
  })
})
