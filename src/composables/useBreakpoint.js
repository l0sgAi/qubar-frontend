import { ref, computed } from 'vue'

// 全站断点单一来源；CSS 侧无法消费变量，main.css 顶部有同步注释约定（改必须双改）：
//   ≤768px   移动端：SideNav 转 NDrawer 抽屉、内容区 margin-left 归零
//   769–1024 平板：SideNav 默认折叠为 64px
//   >1024    桌面
export const BP_MOBILE = 768
export const BP_TABLET = 1024

// 模块级单例：matchMedia 监听全应用只注册一次，所有页面共享同一组 ref。
// 不卸载是刻意的——生命周期 = 应用生命周期。
const mqlMobile = window.matchMedia(`(max-width: ${BP_MOBILE}px)`)
const mqlTablet = window.matchMedia(`(max-width: ${BP_TABLET}px)`)

const mobile = ref(mqlMobile.matches)
const tablet = ref(!mqlMobile.matches && mqlTablet.matches)

const sync = () => {
  mobile.value = mqlMobile.matches
  tablet.value = !mqlMobile.matches && mqlTablet.matches
}
mqlMobile.addEventListener('change', sync)
mqlTablet.addEventListener('change', sync)

export function useBreakpoint() {
  return {
    isMobile: mobile, // Ref<boolean> ≤768
    isTablet: tablet, // Ref<boolean> 769–1024
    isDesktop: computed(() => !mobile.value && !tablet.value)
  }
}
