<template>
  <div class="success-page">
    <!-- 动态背景 -->
    <AnimatedBackground />

    <NCard class="success-container" :bordered="false">
      <div class="success-view">
        <h2 class="welcome-title">欢迎回来!</h2>
        <NButton
          type="primary"
          size="large"
          class="enter-btn"
          @click="handleEnterCommunity"
          :loading="loading"
        >
          {{ loading ? '处理中...' : '进入社区' }}
        </NButton>
      </div>
    </NCard>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { NCard, NButton, NScrollbar, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import { auth } from '@/utils/auth'

const router = useRouter()
const message = useMessage()

const token = ref('')
const userEmail = ref('')
const loading = ref(false)

const userInitial = computed(() => {
  return userEmail.value ? userEmail.value.charAt(0).toUpperCase() : '✓'
})

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)

  // 方式1：后端直接在 URL 参数中返回 token
  const urlToken = urlParams.get('token')
  const expire = urlParams.get('expire') || '259200' // 默认 3 天
  const email = urlParams.get('email')

  if (urlToken) {
    // 后端直接返回 token
    handleLoginSuccess(urlToken, expire, email || 'user@example.com')
    return
  }

  // 方式2：后端返回 JSON 格式（需要解析）
  // 检查 URL 中是否有特殊标识，或者尝试读取页面内容
  const code = urlParams.get('code')
  if (code) {
    // Google OAuth 回调，需要发送给后端
    try {
      message.loading('正在登录...', { duration: 0 })

      const response = await fetch('https://api.qubar.site/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      })

      const data = await response.json()

      if (data.code === 200 && data.data && data.data.token) {
        handleLoginSuccess(data.data.token, data.data.expire, data.data.email || 'user@example.com')
      } else {
        throw new Error(data.message || '登录失败')
      }
    } catch (error) {
      message.destroyAll()
      message.error('登录失败: ' + error.message)
      // console.error('OAuth 登录错误:', error)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
    return
  }

  // 既没有 token 也没有 code，可能是直接访问
  message.warning('未检测到登录信息，正在跳转到登录页...')
  setTimeout(() => {
    router.push('/')
  }, 2000)
})

const handleLoginSuccess = (tokenValue, expire, email) => {
  token.value = tokenValue
  userEmail.value = email

  // 保存 token
  auth.setToken(tokenValue, expire)

  // 清除 URL 中的参数
  window.history.replaceState({}, document.title, window.location.pathname)

  loading.value = false
  message.destroyAll()
  message.success('登录成功！', { duration: 2000 })
  // console.log('登录成功，Token已保存:', {
  //   token: tokenValue.substring(0, 20) + '...',
  //   expire: expire + '秒',
  //   email: email
  // })

  // 自动跳转到主页
  setTimeout(() => {
    router.push('/home')
  }, 1500)
}

const handleEnterCommunity = () => {
  // 跳转到系统主页
  router.push('/home')
}
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.success-container {
  position: relative;
  z-index: 1;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 480px;
  padding: 40px 32px;
  text-align: center;
}

.success-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.5s ease;
}

.avatar-placeholder {
  width: 90px;
  height: 90px;
  background: var(--primary-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  border: 3px solid var(--glass-border);
}

.welcome-title {
  color: var(--text-primary);
  margin-bottom: 12px;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.user-email {
  color: var(--text-secondary);
  margin-bottom: 24px;
  font-size: 0.95rem;
}

.token-section {
  width: 100%;
  text-align: left;
  margin-bottom: 28px;
}

.token-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.token-box {
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  padding: 16px;
  border-radius: 12px;
  word-break: break-all;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: left;
  line-height: 1.6;
  transition: all 0.3s ease;
}

.token-box:hover {
  border-color: var(--accent-color);
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.2);
}

.enter-btn {
  width: 100%;
  height: 52px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  background: var(--primary-gradient);
  border: none;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.enter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
}

.enter-btn:active {
  transform: translateY(0);
}

/* NaiveUI 组件样式覆盖 */
:deep(.n-card) {
  background: transparent !important;
}

:deep(.n-scrollbar) {
  background: var(--bg-secondary) !important;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

:deep(.n-scrollbar-container) {
  padding: 4px;
}

:deep(.n-scrollbar-rail) {
  background: var(--bg-tertiary) !important;
}

:deep(.n-scrollbar-handle) {
  background: var(--accent-color) !important;
}
</style>
