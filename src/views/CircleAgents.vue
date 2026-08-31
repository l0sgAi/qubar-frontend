<template>
  <div class="circle-agents-page">
    <!-- 顶栏 -->
    <AppHeader />

    <!-- 侧边栏 -->
    <SideNav @collapsed="offset = 64" @expanded="offset = 260" />

    <!-- 主内容区域 -->
    <div class="content-wrapper" :style="{ 'margin-left': `${offset}px`, width: `calc(100% - ${offset}px)` }">
      <div class="main-content">
        <div class="circle-agents-container">
          <!-- 页头 -->
          <div class="page-header">
            <h1 class="page-title">
              {{ circleName ? t('agent.circlePage.titleWithName', { name: circleName }) : t('title.circleAgents') }}
            </h1>
            <NButton size="small" quaternary class="back-btn" @click="goBack">
              {{ t('agent.circlePage.backToList') }}
            </NButton>
          </div>

          <!-- 占位内容：Phase 2/3 落地后替换为真实的圈子级代理管理 UI -->
          <div class="under-construction">
            <NIcon size="56" color="rgba(255,255,255,0.25)"><RobotIcon /></NIcon>
            <p>{{ t('agent.circlePage.underConstruction') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { RobotOutlined as RobotIcon } from '@vicons/antd'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import SideNav from '@/components/SideNav.vue'
import { getCircleDetail } from '@/api/circle'
import { usePageTitle } from '@/composables/usePageTitle'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { setTitleData } = usePageTitle()
const offset = ref(260)

// 圈子名：仅用于页头与标签页标题展示；加载失败回退通用标题，不阻塞页面
const circleName = ref('')

onMounted(async () => {
  try {
    const res = await getCircleDetail(route.params.id)
    circleName.value = res.data?.name || ''
    if (circleName.value) {
      setTitleData('title.circleAgentsName', { name: circleName.value })
    }
  } catch (e) {
    console.error('获取圈子详情失败:', e)
  }
})

const goBack = () => router.push('/admin/agents')
</script>

<style scoped>
.circle-agents-page {
  min-height: 100vh;
}

.content-wrapper {
  display: flex;
  padding-top: var(--header-height);
}

.main-content {
  flex: 1;
  min-width: 0;
  padding: 24px;
}

/* 主容器：暗色玻璃拟态大卡片（与 AdminAgents 同一配方） */
.circle-agents-container {
  max-width: 1100px;
  margin: 0 auto;
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  box-shadow: var(--shadow-lg);
  padding: 28px;
  animation: circle-agents-enter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes circle-agents-enter {
  from {
    opacity: 0;
    transform: scale(0.98) translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* 标题：主题绿渐变文字 */
.page-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.back-btn {
  border-radius: 10px;
}

/* 建设中占位：内层玻璃卡片 */
.under-construction {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 72px 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  color: var(--text-secondary);
}
</style>
