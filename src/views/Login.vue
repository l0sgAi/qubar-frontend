<template>
  <div class="login-page">
    <!-- 动态背景 -->
    <AnimatedBackground />

    <NCard class="login-container" :bordered="false">
      <div class="logo-area">
        <div class="logo-text">{{ t('common.appName') }}</div>
        <p class="tagline">{{ t('login.tagline') }}</p>
      </div>

      <!-- 装饰性标签，体现社区氛围 -->
      <NSpace class="interest-tags" :size="[8, 8]" justify="center">
        <NTag
          v-for="tag in interestTags"
          :key="tag.name"
          :bordered="false"
          size="small"
          round
        >
          {{ tag.emoji }} {{ tag.name }}
        </NTag>
      </NSpace>

      <div class="login-section">
        <NButton
          type="primary"
          size="large"
          class="google-btn"
          @click="handleGoogleLogin"
          :loading="loading"
        >
          <template #icon>
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google Logo"
              class="google-icon"
            />
          </template>
          使用 Google 账号继续
        </NButton>

        <NButton
          type="primary"
          size="large"
          class="github-btn"
          @click="handleGithubLogin"
          :loading="loading"
        >
          <template #icon>
            <svg
              viewBox="0 0 24 24"
              class="github-icon"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </template>
          使用 GitHub 继续
        </NButton>

        <NButton
          type="primary"
          size="large"
          class="azure-btn"
          @click="handleAzureLogin"
          :loading="loading"
        >
          <template #icon>
            <svg viewBox="0 0 23 23" class="azure-icon">
              <path fill="#f35325" d="M1 1h10v10H1z"/>
              <path fill="#81bc06" d="M12 1h10v10H12z"/>
              <path fill="#05a6f0" d="M1 12h10v10H1z"/>
              <path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
          </template>
          使用 Microsoft 继续
        </NButton>
      </div>

      <p class="footer">
        {{ t('login.loginAgreement') }}
        <router-link to="/terms" class="footer-link">{{ t('login.userAgreement') }}</router-link>
        {{ t('login.and') }}
        <router-link to="/privacy" class="footer-link">{{ t('login.privacyPolicy') }}</router-link>
      </p>
    </NCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NCard, NButton, NSpace, NTag, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import AnimatedBackground from '@/components/AnimatedBackground.vue'

const message = useMessage()
const { t } = useI18n()
const loading = ref(false)

const interestTags = [
  { name: '摄影', emoji: '📷' },
  { name: '露营', emoji: '⛺' },
  { name: '咖啡', emoji: '☕' },
  { name: '编程', emoji: '💻' },
  { name: '艺术', emoji: '🎨' },
  { name: '音乐', emoji: '🎵' },
  { name: '极限运动', emoji: '🛹' }
]

const handleGoogleLogin = () => {
  loading.value = true
  // 跳转到 Google 登录
  window.location.href = 'https://undeclared-porsha-nonformatively.ngrok-free.dev/auth/google/login'
}

const handleGithubLogin = () => {
  loading.value = true
  // 跳转到 GitHub 登录
  window.location.href = 'https://undeclared-porsha-nonformatively.ngrok-free.dev/auth/github/login'
}

const handleAzureLogin = () => {
  loading.value = true
  // 跳转到 Azure 登录
  window.location.href = 'https://undeclared-porsha-nonformatively.ngrok-free.dev/auth/azure/login'
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.login-container {
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-container:hover {
  box-shadow: var(--shadow-lg);
}

.logo-area {
  margin-bottom: 24px;
}

.logo-text {
  font-size: 2.5rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.tagline {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  font-weight: 400;
}

.interest-tags {
  margin: 28px 0;
}

.login-section {
  margin: 32px 0;
}

.google-btn {
  width: 100%;
  height: 52px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  background-color: var(--google-btn-bg);
  color: var(--google-btn-text);
  border: 1px solid var(--google-btn-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.google-btn:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--accent-color);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.google-btn:active {
  transform: translateY(0);
}

.google-icon {
  width: 22px;
  height: 22px;
}

.github-btn {
  width: 100%;
  height: 52px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  background-color: var(--google-btn-bg);
  color: var(--google-btn-text);
  border: 1px solid var(--google-btn-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  margin-top: 12px;
}

.github-btn:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--accent-color);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.github-btn:active {
  transform: translateY(0);
}

.github-icon {
  width: 22px;
  height: 22px;
  filter: brightness(0) invert(1);
}

.azure-btn {
  width: 100%;
  height: 52px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  background-color: var(--google-btn-bg);
  color: var(--google-btn-text);
  border: 1px solid var(--google-btn-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  margin-top: 12px;
}

.azure-btn:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--accent-color);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.azure-btn:active {
  transform: translateY(0);
}

.azure-icon {
  width: 22px;
  height: 22px;
}

.footer {
  margin-top: 32px;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  line-height: 1.5;
  text-align: center;
}

.footer-link {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border-bottom: 1px dashed transparent;
}

.footer-link:hover {
  color: var(--accent-secondary);
  border-bottom-color: var(--accent-secondary);
}

/* NaiveUI 组件样式覆盖 */
:deep(.n-card) {
  background: transparent !important;
}

:deep(.n-tag) {
  background: var(--bg-tertiary) !important;
  color: var(--text-secondary) !important;
  border: 1px solid var(--glass-border) !important;
  transition: all 0.3s ease;
}

:deep(.n-tag:hover) {
  background: rgba(102, 126, 234, 0.2) !important;
  color: var(--text-primary) !important;
  border-color: var(--accent-color) !important;
  transform: translateY(-2px);
}
</style>
