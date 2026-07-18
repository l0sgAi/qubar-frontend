<template>
  <div class="hot-page">
    <!-- 顶栏 -->
    <AppHeader />

    <!-- 侧边栏 -->
    <SideNav @collapsed="offset = 64" @expanded="offset = 260" />

    <!-- 主内容区域和右侧栏的容器 -->
    <div class="content-wrapper" :style="{ 'margin-left': `${offset}px`, width: `calc(100% - ${offset}px)` }">
      <!-- 主内容区域 -->
      <div class="main-content">
        <div class="hot-container">
          <!-- 顶部：标题 + 时间窗切换 + 更新时间 -->
          <div class="hot-header">
            <div class="header-left">
              <h1 class="page-title">🔥 {{ t('trending.title') }}</h1>
              <span class="refreshed-label">{{ refreshedLabel }}</span>
            </div>
            <NRadioGroup v-model:value="window" size="small" @update:value="handleWindowChange">
              <NRadioButton value="24h">{{ t('trending.window24h') }}</NRadioButton>
              <NRadioButton value="7d">{{ t('trending.window7d') }}</NRadioButton>
            </NRadioGroup>
          </div>

          <!-- 全空态 -->
          <div v-if="!loading && isEmpty" class="hot-empty">
              {{ t('trending.empty') }}
          </div>

          <!-- 三段榜单 -->
          <template v-else>
            <section v-for="sec in sections" :key="sec.type" class="trending-section">
              <div class="section-title">{{ t(sec.labelKey) }}</div>

              <!-- 骨架 -->
              <div v-if="loading" class="section-list">
                <div v-for="i in 5" :key="i" class="skel-row">
                  <div class="skel skel-rank"></div>
                  <div class="skel skel-avatar"></div>
                  <div class="skel-text">
                    <div class="skel skel-line"></div>
                    <div class="skel skel-line short"></div>
                  </div>
                  <div class="skel skel-hot"></div>
                </div>
              </div>

              <!-- 列表 -->
              <div v-else-if="sec.list.length" class="section-list">
                <TrendingCard
                  v-for="(item, idx) in sec.list"
                  :key="`${sec.type}-${item.id || idx}`"
                  :type="sec.type"
                  :rank="idx + 1"
                  :item="item"
                />
              </div>
            </section>
          </template>
        </div>
      </div>

      <!-- 右侧信息栏 -->
      <RightSidebar />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { NRadioGroup, NRadioButton, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import SideNav from '@/components/SideNav.vue'
import RightSidebar from '@/components/RightSidebar.vue'
import TrendingCard from '@/components/TrendingCard.vue'
import { getTrending } from '@/api/trending'

const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const offset = ref(260)

// 首屏聚合：section=all，每类 size=10，不做翻页
const SECTION_SIZE = 10
const window = ref('24h')

const posts = ref([])
const circles = ref([])
const users = ref([])
const refreshedAt = ref(0)
const loading = ref(false)

// 拉取世代：切时间窗时丢弃过期响应
let fetchGen = 0

// 三段配置（顺序：帖子 → 圈子 → 用户）
const sections = computed(() => [
  { type: 'post', labelKey: 'trending.posts', list: posts.value },
  { type: 'circle', labelKey: 'trending.circles', list: circles.value },
  { type: 'user', labelKey: 'trending.users', list: users.value }
])

const isEmpty = computed(() =>
  !posts.value.length && !circles.value.length && !users.value.length
)

// 「X 分钟前更新」文案 —— refreshedAt 为 Unix 秒；0 = 从未刷新
const nowMs = ref(Date.now())
let ticker = null
const refreshedLabel = computed(() => {
  const ts = refreshedAt.value
  if (!ts) return t('trending.refreshedNever')
  const diffMin = Math.floor((nowMs.value - ts * 1000) / 60000)
  if (diffMin < 1) return t('trending.refreshedJustNow')
  if (diffMin < 60) return t('trending.refreshedMinutesAgo', { n: diffMin })
  const diffH = Math.floor(diffMin / 60)
  return t('trending.refreshedHoursAgo', { n: diffH })
})

const fetchTrending = async () => {
  fetchGen++
  const gen = fetchGen
  loading.value = true
  try {
    const res = await getTrending({ window: window.value, section: 'all', size: SECTION_SIZE })
    if (gen !== fetchGen) return
    const data = res.data || {}
    posts.value = data.posts || []
    circles.value = data.circles || []
    users.value = data.users || []
    refreshedAt.value = data.refreshed_at || 0
  } catch (e) {
    if (gen !== fetchGen) return
    console.error('获取热点榜单失败:', e)
    message.error(e.message || t('trending.loadFailed'))
    posts.value = []
    circles.value = []
    users.value = []
  } finally {
    if (gen === fetchGen) loading.value = false
  }
}

const handleWindowChange = () => {
  posts.value = []
  circles.value = []
  users.value = []
  fetchTrending()
}

onMounted(() => {
  // 热点页访客可读：/trending 已开放 anonymous，无需登录检查
  fetchTrending()
  // 每分钟刷新一次「X 分钟前」文案
  ticker = setInterval(() => { nowMs.value = Date.now() }, 60000)
})

onBeforeUnmount(() => {
  if (ticker) clearInterval(ticker)
})
</script>

<style scoped>
.hot-page {
  min-height: 100vh;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
  transition: margin-left 0.3s ease, width 0.3s ease;
}

.main-content {
  flex: 1;
  min-width: 0;
  max-width: 720px;
  margin: 0 auto;
}

.hot-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 顶部 */
.hot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.refreshed-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

/* 全空态 */
.hot-empty {
  padding: 80px 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

/* 段落 */
.trending-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  padding: 4px 2px;
}

.section-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 骨架 */
.skel-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
}

.skel {
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.16) 37%, rgba(255,255,255,0.06) 63%);
  background-size: 400% 100%;
  animation: hot-skel-shimmer 1.4s ease infinite;
  border-radius: 6px;
}

.skel-rank { width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0; }
.skel-avatar { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; }
.skel-text { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.skel-line { height: 12px; width: 60%; }
.skel-line.short { width: 35%; }
.skel-hot { width: 48px; height: 16px; flex-shrink: 0; }
</style>

<!-- 骨架 shimmer 关键帧（全局：骨架元素 class 无 scoped data-v） -->
<style>
@keyframes hot-skel-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
</style>
