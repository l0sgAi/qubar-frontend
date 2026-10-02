/**
 * 响应式断点（单一事实源，见 docs/mobile-adaptation-plan.md 5.1）。
 * CSS 媒体查询无法引用变量，main.css 与各组件 @media 须手写同一数值：
 *   ≤ 768px → 移动端门户；> 768px → 桌面布局
 */
export const BP_MOBILE_MAX = 768
export const MOBILE_QUERY = `(max-width: ${BP_MOBILE_MAX}px)`

// 移动端外框（MobileTopBar / MobileTabBar）总开关。
// P0 只铺基础设施，保持 false：手机上仍渲染原桌面布局，不暴露半成品；P1 完成后打开
export const MOBILE_SHELL_ENABLED = false
