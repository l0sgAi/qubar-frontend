<template>
  <NConfigProvider :theme="darkTheme" :locale="naiveUILocale">
    <NGlobalStyle />
    <NMessageProvider>
      <NDialogProvider>
        <!-- meta.pageFade 的路由（圈子管理两页）用 out-in 过渡。
             duration 显式声明换场时机（根节点无过渡属性，Vue 无法自动探测），
             动画本体只作用于各页 .main-content，见 main.css 的 .page-fade-* -->
        <router-view v-slot="{ Component, route }">
          <Transition
            v-if="route.meta.pageFade"
            name="page-fade"
            mode="out-in"
            :duration="{ enter: 220, leave: 160 }"
          >
            <component :is="Component" :key="route.name" />
          </Transition>
          <component v-else :is="Component" />
        </router-view>
        <!-- 全局访客操作登录引导（写操作前置拦截，避免触发 401 硬跳转） -->
        <LoginPromptModal />
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup>
import { computed, ref, provide, readonly, watch } from 'vue'
import { useRouter } from 'vue-router'
import { darkTheme, zhCN, enUS } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { NConfigProvider, NGlobalStyle, NMessageProvider, NDialogProvider } from 'naive-ui'
import LoginPromptModal from '@/components/LoginPromptModal.vue'
import { applyPageTitle } from '@/utils/pageTitle'

const router = useRouter()
const { locale } = useI18n()

// 圈子搜索状态
const circleSearchState = ref({
  id: null,
  name: '',
  avatarUrl: ''
})

// 设置圈子搜索状态
const setCircleSearch = (circle) => {
  circleSearchState.value = {
    id: circle.id,
    name: circle.name,
    avatarUrl: circle.avatar_url || ''
  }
}

// 清除圈子搜索状态
const clearCircleSearch = () => {
  circleSearchState.value = {
    id: null,
    name: '',
    avatarUrl: ''
  }
}

// 提供圈子搜索状态和方法
provide('circleSearchState', readonly(circleSearchState))
provide('setCircleSearch', setCircleSearch)
provide('clearCircleSearch', clearCircleSearch)

// 监听路由变化，在跳转到主页、热门、发现等页面时清除圈子搜索状态
watch(() => router.currentRoute.value.name, (newRouteName) => {
  // 定义需要清除圈子搜索状态的页面
  const pagesToClear = ['home', 'hot', 'discover']

  if (pagesToClear.includes(newRouteName)) {
    clearCircleSearch()
  }
}, { immediate: false })

// Naive UI 组件国际化
const naiveUILocale = computed(() => locale.value === 'zh-CN' ? zhCN : enUS)

// 语言切换时同步刷新浏览器标签页标题（路由切换时由 afterEach 处理）
watch(locale, () => {
  applyPageTitle(router.currentRoute.value)
})
</script>

<style>
/* 全局样式已在 assets/main.css 中定义 */
</style>
