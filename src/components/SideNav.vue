<template>
  <NLayout has-sider class="side-layout">
    <NLayoutSider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="260"
      :collapsed="isCollapsed"
      show-trigger
      @collapse="whenCollapsedCLick"
      @expand="whenExpandCLick"
      class="custom-sider"
    >
      <!-- 导航菜单 -->
      <NMenu
        :collapsed="isCollapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeItem"
        @update:value="handleMenuSelect"
      />
    </NLayoutSider>

    <!-- 新建兴趣圈弹窗 -->
    <CreateCircleModal
      v-model:show="showCreateModal"
      @success="handleCreateSuccess"
    />
  </NLayout>
</template>

<script setup>
import { ref, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NLayout,
  NLayoutSider,
  NMenu,
  NIcon
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import CreateCircleModal from './CreateCircleModal.vue'

const router = useRouter()
const { t } = useI18n()
const emit = defineEmits(['collapsed', 'expanded'])

const whenCollapsedCLick = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('collapsed')
}
const whenExpandCLick = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('expanded')
}
// 自定义 SVG 图标组件
const createIcon = (svgPath) => {
  return () => h('svg', {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    style: { width: '20px', height: '20px' }
  }, svgPath.map(path => h('path', { d: path })))
}

// 主页图标
const HomeIcon = createIcon([
  'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'M9 22V12h6v10'
])

// 热点图标
const FireIcon = createIcon([
  'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'
])

// 发现图标
const ExploreIcon = createIcon([
  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'
])

// 新建图标
const PlusIcon = createIcon([
  'M12 5v14M5 12h14'
])

// 是否折叠
const isCollapsed = ref(false)

// 新建兴趣圈弹窗状态
const showCreateModal = ref(false)

// 当前激活的导航项
const activeItem = ref('home')

// 我加入的兴趣圈（示例数据）- 每个圈有不同的彩虹色
const joinedCircles = ref([
  { id: '1', name: 'Vue.js 开发者', color: '#42b883' },
  { id: '2', name: '前端技术交流', color: '#3b82f6' },
  { id: '3', name: 'UI/UX 设计', color: '#ec4899' },
  { id: '4', name: '摄影爱好者', color: '#f59e0b' }
])

// 近期活跃的兴趣圈（示例数据）
const activeCircles = ref([
  { id: '5', name: 'React 社区', color: '#06b6d4' },
  { id: '6', name: 'Node.js 实战', color: '#22c55e' },
  { id: '7', name: 'Python 学习', color: '#8b5cf6' }
])

// 渲染兴趣圈图标
const renderCircleIcon = (circle) => {
  return h('div', {
    class: 'circle-icon',
    style: {
      width: '24px',
      height: '24px',
      borderRadius: '6px',
      background: `linear-gradient(135deg, ${circle.color}dd, ${circle.color}99)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold'
    }
  }, circle.name.charAt(0))
}

// 菜单选项
const menuOptions = computed(() => {
  // 折叠时只显示主要菜单项
  if (isCollapsed.value) {
    return [
      {
        label: t('nav.home'),
        key: 'home',
        icon: () => h(NIcon, null, { default: () => h(HomeIcon) })
      },
      {
        label: t('nav.hot'),
        key: 'hot',
        icon: () => h(NIcon, null, { default: () => h(FireIcon) })
      },
      {
        label: t('nav.discover'),
        key: 'explore',
        icon: () => h(NIcon, null, { default: () => h(ExploreIcon) })
      },
      {
        label: t('circle.createCircle'),
        key: 'create',
        icon: () => h(NIcon, null, { default: () => h(PlusIcon) })
      }
    ]
  }

  // 展开时显示完整菜单
  return [
    {
      label: t('nav.home'),
      key: 'home',
      icon: () => h(NIcon, null, { default: () => h(HomeIcon) })
    },
    {
      label: t('nav.hot'),
      key: 'hot',
      icon: () => h(NIcon, null, { default: () => h(FireIcon) })
    },
    {
      label: t('nav.discover'),
      key: 'explore',
      icon: () => h(NIcon, null, { default: () => h(ExploreIcon) })
    },
    {
      label: t('circle.createCircle'),
      key: 'create',
      icon: () => h(NIcon, null, { default: () => h(PlusIcon) })
    },
    {
      type: 'divider',
      key: 'd1'
    },
    {
      type: 'group',
      label: t('circle.myCircles'),
      key: 'joined-group',
      children: joinedCircles.value.map(circle => ({
        label: circle.name,
        key: `circle-${circle.id}`,
        icon: () => renderCircleIcon(circle)
      }))
    },
    {
      type: 'divider',
      key: 'd2'
    },
    {
      type: 'group',
      label: t('circle.active'),
      key: 'active-group',
      children: activeCircles.value.map(circle => ({
        label: circle.name,
        key: `circle-${circle.id}`,
        icon: () => renderCircleIcon(circle)
      }))
    }
  ]
})

// 菜单选择处理
const handleMenuSelect = (key) => {
  activeItem.value = key

  if (key === 'create') {
    showCreateModal.value = true
  } else if (key === 'home') {
    router.push('/home')
  } else if (key.startsWith('circle-')) {
    // 提取圈子 ID
    const circleId = key.replace('circle-', '')
    router.push(`/circle/${circleId}`)
  } else {
    console.log('Navigate to:', key)
  }
}

// 创建成功回调
const handleCreateSuccess = (data) => {
  console.log('兴趣圈创建成功:', data)
  // 如果返回的数据中包含圈子ID，跳转到圈子详情页
  if (data && data.id) {
    router.push(`/circle/${data.id}`)
  }
}
</script>

<style scoped>
.side-layout {
  position: fixed;
  left: 0;
  top: var(--header-height);
  bottom: 0;
  z-index: 999;
  overflow-y: hidden !important;
}

.custom-sider {
  background: rgba(24, 24, 35, 0.95) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
  height: calc(100vh - var(--header-height));
  overflow-y: auto;
}

/* 自定义滚动条 */
.custom-sider::-webkit-scrollbar {
  width: 6px;
}

.custom-sider::-webkit-scrollbar-track {
  background: transparent;
}

.custom-sider::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-sider::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* NaiveUI Menu 组件样式覆盖 */
:deep(.n-menu) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;
  padding: 12px;
}

:deep(.n-menu-item) {
  border-radius: 12px !important;
  margin: 4px 0 !important;
  color: rgba(255, 255, 255, 0.7) !important;
  transition: all 0.2s ease !important;
}

/* :deep(.n-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.9) !important;
} */

:deep(.n-menu-item.n-menu-item--selected) {
  background: linear-gradient(135deg,
    rgba(236, 72, 153, 0.2) 0%,
    rgba(168, 85, 247, 0.2) 50%,
    rgba(59, 130, 246, 0.2) 100%) !important;
  color: #ec4899 !important;
  font-weight: 600;
}

:deep(.n-menu-item-content) {
  display: flex !important;
  align-items: center !important;
  padding: 8px 12px !important;
}

:deep(.n-menu-item-content__icon) {
  color: inherit !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.n-menu-item-content-header) {
  color: inherit !important;
}

/* 折叠状态下的图标居中 */
:deep(.n-menu--collapsed .n-menu-item-content) {
  padding: 12px !important;
  justify-content: center !important;
}

:deep(.n-menu--collapsed .n-menu-item-content__icon) {
  margin-right: 0 !important;
}

/* 折叠时隐藏所有文字 */
:deep(.n-menu--collapsed .n-menu-item-content-header) {
  display: none !important;
}

/* 分组标题样式 */
:deep(.n-menu-group-title) {
  color: rgba(255, 255, 255, 0.5) !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  padding: 12px 12px 8px 12px !important;
}

/* 折叠时隐藏分组标题和分组内的菜单项 */
:deep(.n-menu--collapsed .n-menu-group-title) {
  display: none !important;
}

:deep(.n-menu--collapsed .n-menu-group) {
  display: none !important;
}

/* 折叠时隐藏分割线 */
:deep(.n-menu--collapsed .n-divider) {
  display: none !important;
}

/* 分割线样式 */
:deep(.n-menu-item.n-menu-item--collapsed + .n-menu-item::before) {
  display: none;
}

:deep(.n-divider) {
  background: rgba(255, 255, 255, 0.1) !important;
  margin: 8px 0 !important;
}

/* 折叠触发器样式 */
:deep(.n-layout-sider-trigger) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.6) !important;
  transition: all 0.3s ease !important;
}

:deep(.n-layout-sider-trigger:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* 折叠按钮样式 */
:deep(.n-layout-toggle-button) {
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  width: 24px !important;
  height: 24px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  z-index: 1000 !important;
}

/* Tooltip 样式调整 - 确保居中 */
:deep(.n-tooltip) {
  border-radius: 8px !important;
}

/* 兴趣圈图标动画 */
.circle-icon {
  transition: transform 0.2s ease;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.n-menu-item:hover .circle-icon) {
  transform: scale(1.1);
}

:deep(.n-layout-toggle-button){
  background-color: transparent !important;
  border: none !important;
}
</style>
