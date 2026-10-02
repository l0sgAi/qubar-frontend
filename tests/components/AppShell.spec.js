import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h, nextTick, onMounted, ref } from 'vue'
import { mount } from '@vue/test-utils'

const flags = vi.hoisted(() => ({ enabled: true }))
vi.mock('@/constants/breakpoints', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    get MOBILE_SHELL_ENABLED() { return flags.enabled }
  }
})

// 外框子组件替换为轻量 stub（真实组件依赖 i18n / naive-ui / 接口）
vi.mock('@/components/layout/AppHeader.vue', () => ({
  default: { name: 'AppHeader', render: () => h('header', { class: 'stub-header' }) }
}))
vi.mock('@/components/layout/SideNav.vue', () => ({
  default: {
    name: 'SideNav',
    emits: ['collapsed', 'expanded'],
    render: () => h('nav', { class: 'stub-sidenav' })
  }
}))

const { default: AppShell } = await import('@/components/layout/AppShell.vue')
const { useAppShell } = await import('@/composables/useAppShell')
const { __resetBreakpoint } = await import('@/composables/useBreakpoint')
const { setMatchMedia } = await import('../setup')

// 模拟迁移后的页面：<AppShell v-model:offset> + 兄弟内容节点
const mountPage = () => {
  const mounted = ref(0)
  const Content = defineComponent({
    setup() {
      onMounted(() => { mounted.value++ })
      return () => h('section', { class: 'page-content' })
    }
  })
  const Page = defineComponent({
    setup() {
      const { offset, mobileShell, contentStyle } = useAppShell()
      return () => h('div', { class: 'page' }, [
        h(AppShell, { offset: offset.value, 'onUpdate:offset': (v) => { offset.value = v } }),
        h('div', { class: 'content-wrapper', style: contentStyle.value }, [h(Content)]),
        mobileShell.value ? null : h('aside', { class: 'right-sidebar' })
      ])
    }
  })
  return { wrapper: mount(Page), mounted }
}

describe('AppShell', () => {
  beforeEach(() => {
    __resetBreakpoint()
    flags.enabled = true
  })

  it('桌面：渲染 AppHeader + SideNav，内容区让出侧栏宽度', () => {
    const { wrapper } = mountPage()
    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(wrapper.find('.stub-sidenav').exists()).toBe(true)
    expect(wrapper.find('.content-wrapper').attributes('style')).toContain('margin-left: 260px')
  })

  it('不额外包裹 DOM：外框与内容是页面根的直接子节点', () => {
    const { wrapper } = mountPage()
    const children = Array.from(wrapper.element.children).map(el => el.className)
    expect(children).toEqual(['stub-header', 'stub-sidenav', 'content-wrapper', 'right-sidebar'])
  })

  it('SideNav 收起 / 展开回写 offset', async () => {
    const { wrapper } = mountPage()
    const sideNav = wrapper.findComponent({ name: 'SideNav' })
    sideNav.vm.$emit('collapsed')
    await nextTick()
    expect(wrapper.find('.content-wrapper').attributes('style')).toContain('margin-left: 64px')
    sideNav.vm.$emit('expanded')
    await nextTick()
    expect(wrapper.find('.content-wrapper').attributes('style')).toContain('margin-left: 260px')
  })

  it('移动端外框：不渲染桌面顶栏 / 侧栏 / 右栏，内容不偏移', () => {
    setMatchMedia(true)
    const { wrapper } = mountPage()
    expect(wrapper.find('.stub-header').exists()).toBe(false)
    expect(wrapper.find('.stub-sidenav').exists()).toBe(false)
    expect(wrapper.find('.right-sidebar').exists()).toBe(false)
    expect(wrapper.find('.content-wrapper').attributes('style')).toBeUndefined()
  })

  it('总开关关闭时手机断点仍渲染桌面外框（P0）', () => {
    flags.enabled = false
    setMatchMedia(true)
    const { wrapper } = mountPage()
    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(wrapper.find('.stub-sidenav').exists()).toBe(true)
  })

  it('跨断点切换外框，页面内容不 remount', async () => {
    const { wrapper, mounted } = mountPage()
    expect(mounted.value).toBe(1)

    setMatchMedia(true)
    await nextTick()
    expect(wrapper.find('.stub-header').exists()).toBe(false)

    setMatchMedia(false)
    await nextTick()
    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(mounted.value).toBe(1)
  })
})
