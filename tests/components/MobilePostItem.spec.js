import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('naive-ui', async (importOriginal) => ({
  ...(await importOriginal()),
  useMessage: () => ({ info: vi.fn() })
}))
import MobilePostItem from '@/components/post/MobilePostItem.vue'
import PostCard from '@/components/post/PostCard.vue'
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
