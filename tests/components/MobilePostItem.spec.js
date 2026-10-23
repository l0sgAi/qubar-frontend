import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { h } from 'vue'
import { NTag } from 'naive-ui'

vi.mock('naive-ui', async (importOriginal) => ({
  ...(await importOriginal()),
  useMessage: () => ({ info: vi.fn() })
}))
import MobilePostItem from '@/components/post/MobilePostItem.vue'
import PostCard from '@/components/post/PostCard.vue'
import PostStatusTag from '@/components/post/PostStatusTag.vue'
import { __resetBreakpoint } from '@/composables/useBreakpoint'
import { setMatchMedia } from '../setup'
import { createTestI18n, createTestRouter } from '../helpers/plugins'

const routes = [{ path: '/' }, { path: '/post/:id' }, { path: '/circle/:id' }, { path: '/user/:id' }]

const plugins = () => [createTestI18n(), createTestRouter(routes)]

const mountItem = (props = {}, slots = {}) => mount(MobilePostItem, {
  props: { postId: 'p1', title: '标题', primaryName: '圈子A', ...props },
  slots,
  global: { plugins: plugins() }
})

describe('MobilePostItem', () => {
  it('整项链接到帖子详情，头部显示主 / 次来源与时间', () => {
    const wrapper = mountItem({
      content: '摘要',
      primaryTo: '/circle/c1',
      secondaryName: '作者B',
      secondaryTo: '/user/u1',
      timeText: '3 小时前'
    })
    expect(wrapper.find('.m-cover-link').attributes('href')).toBe('/post/p1')
    expect(wrapper.find('.m-source').attributes('href')).toBe('/circle/c1')
    expect(wrapper.find('.m-source-name').text()).toBe('圈子A')
    expect(wrapper.find('.m-secondary').attributes('href')).toBe('/user/u1')
    expect(wrapper.find('.m-time').text()).toBe('3 小时前')
    expect(wrapper.find('.m-summary').text()).toBe('摘要')
  })

  it('无链接的来源渲染为普通元素（点击落到封面链接）', () => {
    const wrapper = mountItem({ secondaryName: '圈子C' })
    expect(wrapper.find('.m-source').element.tagName).toBe('DIV')
    expect(wrapper.find('.m-secondary').element.tagName).toBe('SPAN')
  })

  it('无图不渲染缩略图；单图无计数；多图显示张数', async () => {
    const wrapper = mountItem()
    expect(wrapper.find('.m-thumb').exists()).toBe(false)

    await wrapper.setProps({ images: ['a.jpg'] })
    expect(wrapper.find('.m-thumb img').attributes('src')).toBe('a.jpg')
    expect(wrapper.find('.m-thumb-count').exists()).toBe(false)

    await wrapper.setProps({ images: ['a.jpg', 'b.jpg', 'c.jpg'] })
    expect(wrapper.find('.m-thumb-count').text()).toBe('3')
  })

  it('置顶 / 精华徽标、meta 插槽、通栏样式', () => {
    const wrapper = mountItem({ pinned: true, essence: true, flush: true }, { meta: '<span class="extra">审核中</span>' })
    expect(wrapper.find('.m-badge.is-pinned').exists()).toBe(true)
    expect(wrapper.find('.m-badge.is-essence').exists()).toBe(true)
    expect(wrapper.find('.m-meta-extra .extra').text()).toBe('审核中')
    expect(wrapper.classes()).toContain('flush')
  })

  it('无 meta 插槽时不渲染右侧容器', () => {
    expect(mountItem().find('.m-meta-extra').exists()).toBe(false)
  })
})

describe('MobilePostItem 驳回 / 屏蔽态（我的帖子）', () => {
  beforeEach(() => {
    __resetBreakpoint()
    document.body.innerHTML = ''
  })

  // 与 MyPosts 一致：状态标签放在 #meta 插槽
  const mountWithStatus = (status, tone = '') => mount(MobilePostItem, {
    props: { postId: 'p1', title: '标题', primaryName: '作者', content: '摘要', tone, flush: true },
    slots: { meta: () => h(PostStatusTag, { status }) },
    global: { plugins: plugins() },
    attachTo: document.body
  })

  const popoverText = () => document.body.querySelector('.post-status-hint')?.textContent || ''

  it('无 tone：不加色条 / 变淡样式', () => {
    const wrapper = mountItem()
    expect(wrapper.classes().some(c => c.startsWith('is-tone-'))).toBe(false)
  })

  it('驳回（status=3）：「未通过审核」+ warning 色条，统计照常显示，整项仍链接到详情', () => {
    const wrapper = mountWithStatus(3, 'warning')
    expect(wrapper.classes()).toContain('is-tone-warning')
    const tag = wrapper.find('.m-meta-extra .post-status-tag')
    expect(tag.exists()).toBe(true)
    expect(tag.text()).toBe('未通过审核')
    expect(wrapper.findComponent(NTag).props('type')).toBe('warning')
    expect(tag.attributes('aria-label')).toContain('仅你自己可见')
    expect(wrapper.find('.m-cover-link').attributes('href')).toBe('/post/p1')
    expect(wrapper.findAll('.m-stat')).toHaveLength(3)
    wrapper.unmount()
  })

  it('移动端：点按标签显示说明（不依赖 hover）', async () => {
    setMatchMedia(true)
    const wrapper = mountWithStatus(3, 'warning')
    expect(popoverText()).toBe('')
    await wrapper.find('.post-status-tag').trigger('click')
    await flushPromises()
    expect(popoverText()).toContain('仅你自己可见。帖子未通过 AI 审核')
    wrapper.unmount()
  })

  it('桌面：悬停标签显示说明', async () => {
    vi.useFakeTimers()
    const wrapper = mountWithStatus(4, 'error')
    await wrapper.find('.post-status-tag').trigger('mouseenter')
    await vi.runAllTimersAsync()
    expect(popoverText()).toContain('帖子被多次举报')
    wrapper.unmount()
  })

  it('屏蔽（status=4）：「已屏蔽，等待复核」+ error 色条', () => {
    const wrapper = mountWithStatus(4, 'error')
    expect(wrapper.classes()).toContain('is-tone-error')
    expect(wrapper.find('.post-status-tag').text()).toBe('已屏蔽，等待复核')
    expect(wrapper.findComponent(NTag).props('type')).toBe('error')
    wrapper.unmount()
  })

  it('审核中（status=2）：说明与 #29 提示条共用「仅你自己可见」', () => {
    const wrapper = mountWithStatus(2)
    expect(wrapper.find('.post-status-tag').text()).toBe('审核中')
    expect(wrapper.find('.post-status-tag').attributes('aria-label')).toContain('帖子正在审核中，仅你自己可见')
    wrapper.unmount()
  })

  it('无说明的状态（草稿）：只渲染普通标签', () => {
    const wrapper = mountWithStatus(0)
    expect(wrapper.find('.post-status-tag').exists()).toBe(false)
    expect(wrapper.find('.m-meta-extra .n-tag').text()).toBe('草稿')
    wrapper.unmount()
  })
})

describe('PostCard 移动端切换', () => {
  beforeEach(() => {
    __resetBreakpoint()
  })

  const props = {
    postId: 'p1',
    circleId: 'c1',
    circleName: '圈子A',
    userId: 'u1',
    userName: '作者B',
    title: '标题',
    postTime: Date.now(),
    coverImage: 'cover.jpg'
  }
  const mountCard = (extra = {}) => mount(PostCard, {
    props: { ...props, ...extra },
    global: { plugins: plugins() }
  })

  it('桌面：渲染原卡片', () => {
    const wrapper = mountCard()
    expect(wrapper.find('.post-card').exists()).toBe(true)
    expect(wrapper.find('.m-post-item').exists()).toBe(false)
  })

  it('移动端：渲染紧凑列表项，主来源为圈子、次来源为作者，封面图作缩略图', () => {
    setMatchMedia(true)
    const wrapper = mountCard()
    expect(wrapper.find('.post-card').exists()).toBe(false)
    expect(wrapper.find('.m-source').attributes('href')).toBe('/circle/c1')
    expect(wrapper.find('.m-secondary').attributes('href')).toBe('/user/u1')
    expect(wrapper.find('.m-thumb img').attributes('src')).toBe('cover.jpg')
  })

  it('移动端圈子内（showCircle=false）：主来源为作者，无次来源', () => {
    setMatchMedia(true)
    const wrapper = mountCard({ showCircle: false })
    expect(wrapper.find('.m-source').attributes('href')).toBe('/user/u1')
    expect(wrapper.find('.m-source-name').text()).toBe('作者B')
    expect(wrapper.find('.m-secondary').exists()).toBe(false)
  })

  it('跨断点切换：不 remount，直接换渲染分支', async () => {
    const wrapper = mountCard()
    setMatchMedia(true)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.m-post-item').exists()).toBe(true)
    setMatchMedia(false)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.post-card').exists()).toBe(true)
  })
})
