import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

const unread = vi.hoisted(() => ({ count: null }))
vi.mock('@/composables/useUnreadNotice', () => ({
  useUnreadNotice: () => ({ unreadCount: unread.count })
}))
vi.mock('naive-ui', async (importOriginal) => ({
  ...(await importOriginal()),
  useMessage: () => ({ warning: vi.fn() })
}))

const { default: MobileTabBar } = await import('@/components/layout/mobile/MobileTabBar.vue')
const { createTestI18n, createTestRouter } = await import('../helpers/plugins')

const ROUTES = ['/', '/home', '/discover', '/hot', '/notifications', '/profile', '/post/:id'].map(path => ({ path }))

const mountAt = async (path) => {
  const router = createTestRouter(ROUTES)
  await router.push(path)
  return mount(MobileTabBar, { global: { plugins: [router, createTestI18n()] } })
}

const labels = (wrapper) => wrapper.findAll('.tab-label').map(el => el.text())
const active = (wrapper) => wrapper.findAll('.tab-item.active').map(el => el.find('.tab-label').text())

describe('MobileTabBar', () => {
  beforeEach(() => {
    unread.count = ref(0)
  })

  it('访客：首页 / 发现 / 登录，登录项带 redirect', async () => {
    const wrapper = await mountAt('/post/1')
    expect(labels(wrapper)).toEqual(['首页', '发现', '登录'])
    const loginHref = wrapper.findAll('a').at(2).attributes('href')
    expect(loginHref).toBe('/?redirect=/post/1&tab=login')
  })

  it('登录态：首页 / 发现 / 消息 / 我的', async () => {
    localStorage.setItem('qubar_token', 'tok')
    localStorage.setItem('qubar_token_expire', String(Date.now() + 60_000))
    const wrapper = await mountAt('/home')
    expect(labels(wrapper)).toEqual(['首页', '发现', '消息', '我的'])
  })

  it.each([
    ['/home', ['首页']],
    ['/hot', ['发现']],
    ['/post/1', []]
  ])('%s 高亮 %o', async (path, expected) => {
    const wrapper = await mountAt(path)
    expect(active(wrapper)).toEqual(expected)
  })

  it('未读角标：0 不显示，超过 99 显示 99+', async () => {
    localStorage.setItem('qubar_token', 'tok')
    localStorage.setItem('qubar_token_expire', String(Date.now() + 60_000))
    const wrapper = await mountAt('/home')
    expect(wrapper.find('.badge').exists()).toBe(false)
    unread.count.value = 5
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.badge').text()).toBe('5')
    unread.count.value = 120
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.badge').text()).toBe('99+')
  })
})
