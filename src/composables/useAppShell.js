import { ref, computed } from 'vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { MOBILE_SHELL_ENABLED } from '@/constants/breakpoints'

// SideNav 展开 / 收起宽度（与 SideNav 的 :width / :collapsed-width 一致）
export const SIDENAV_WIDTH = 260
export const SIDENAV_COLLAPSED_WIDTH = 64

/**
 * 当前是否使用移动端外框（总开关 && 移动端断点）。
 * AppShell 与页面各自调用，读的是同一个 useBreakpoint 单例，结果始终一致。
 */
export function useMobileShell() {
  const { isMobile } = useBreakpoint()
  return computed(() => MOBILE_SHELL_ENABLED && isMobile.value)
}

/**
 * 页面侧布局状态，配合 <AppShell v-model:offset="offset" /> 使用（见 docs/mobile-adaptation-plan.md 5.3）。
 * AppShell 只渲染外框，页面内容是它的兄弟节点：页面 scoped 样式照常命中，跨断点也不会 remount。
 *
 * @returns {{ offset: Ref<number>, mobileShell: ComputedRef<boolean>, contentStyle: ComputedRef<Object> }}
 *   offset       - 侧栏当前宽度，由 AppShell 内的 SideNav 展开/收起回写
 *   mobileShell  - 是否移动端外框（页面据此隐藏 RightSidebar 等桌面专属块）
 *   contentStyle - 内容容器的内联样式：桌面让出侧栏宽度；移动端无侧栏，不偏移
 */
export function useAppShell() {
  const mobileShell = useMobileShell()
  const offset = ref(SIDENAV_WIDTH)
  const contentStyle = computed(() => (mobileShell.value
    ? {}
    : { 'margin-left': `${offset.value}px`, width: `calc(100% - ${offset.value}px)` }))
  return { offset, mobileShell, contentStyle }
}
