<template>
  <nav class="mobile-tabbar">
    <SmartLink
      v-for="item in items"
      :key="item.key"
      class="tab-item"
      :class="{ active: current === item.key }"
      :to="item.to"
      @click="handleClick(item, $event)"
    >
      <span class="tab-icon">
        <NIcon size="24"><component :is="item.icon" /></NIcon>
        <span v-if="item.key === 'notice' && unreadCount > 0" class="badge">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </span>
      <span class="tab-label">{{ t(item.label) }}</span>
    </SmartLink>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NIcon, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { Home, Compass, Bell, User, Login } from '@vicons/tabler'
import SmartLink from '@/components/common/SmartLink.vue'
import { auth } from '@/utils/auth'
import { activeTab, loginLocation } from '@/utils/mobileNav'
import { useUnreadNotice } from '@/composables/useUnreadNotice'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const message = useMessage()

const isLoggedIn = auth.isAuthenticated()

// 未读数与 AppHeader 共用单例连接（见 composables/useUnreadNotice.js）
const { unreadCount } = useUnreadNotice({
  onAuthExpired: () => {
    message.warning(t('common.logout'))
    router.push('/')
  }
})

const items = computed(() => (isLoggedIn
  ? [
      { key: 'home', to: '/home', icon: Home, label: 'mobile.tab.home' },
      { key: 'discover', to: '/discover', icon: Compass, label: 'mobile.tab.discover' },
      { key: 'notice', to: '/notifications', icon: Bell, label: 'mobile.tab.notice' },
      { key: 'me', to: '/profile', icon: User, label: 'mobile.tab.me' }
    ]
  : [
      { key: 'home', to: '/home', icon: Home, label: 'mobile.tab.home' },
      { key: 'discover', to: '/discover', icon: Compass, label: 'mobile.tab.discover' },
      { key: 'login', to: loginLocation(route.fullPath), icon: Login, label: 'mobile.tab.login' }
    ]))

const current = computed(() => activeTab(route.path))

// 再次点击当前 tab：回到顶部（SmartLink 仍会 push 同一路由，router 视为重复导航直接忽略）
const handleClick = (item) => {
  if (item.key === current.value) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<style scoped>
.mobile-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  height: calc(var(--tabbar-height) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  display: flex;
  background: rgba(16, 16, 28, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--glass-border);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--text-tertiary);
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: color 0.2s;
}

.tab-item.active {
  color: #66eac2;
}

.tab-item:active .tab-icon {
  transform: scale(0.92);
}

.tab-icon {
  position: relative;
  display: inline-flex;
  transition: transform 0.15s;
}

.tab-label {
  font-size: 11px;
  line-height: 1;
}

.badge {
  position: absolute;
  top: -4px;
  left: 14px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #e5484d;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
}
</style>
