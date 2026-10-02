<template>
  <!-- 多根节点，只渲染外框（顶栏 + 侧栏），不包裹页面内容：
       桌面 DOM 与迁移前逐节点一致；页面内容不在本组件内，跨断点切换不会 remount。
       用法见 composables/useAppShell.js -->
  <template v-if="mobileShell">
    <!-- P1：MobileTopBar / MobileTabBar（docs/mobile-adaptation-plan.md 第六节） -->
  </template>
  <template v-else>
    <AppHeader />
    <SideNav @collapsed="offset = SIDENAV_COLLAPSED_WIDTH" @expanded="offset = SIDENAV_WIDTH" />
  </template>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import SideNav from '@/components/layout/SideNav.vue'
import { useMobileShell, SIDENAV_WIDTH, SIDENAV_COLLAPSED_WIDTH } from '@/composables/useAppShell'

// 侧栏宽度回写给页面（页面据此计算内容区偏移）
const offset = defineModel('offset', { type: Number, default: SIDENAV_WIDTH })

const mobileShell = useMobileShell()
</script>
