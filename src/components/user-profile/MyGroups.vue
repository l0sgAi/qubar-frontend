<template>
  <div class="my-groups-tab">
    <div class="tab-header">
      <h2 class="tab-title">{{ t('user.myGroups') }}</h2>
      <NInput
        v-model:value="searchKey"
        :placeholder="t('circle.interestCircle')"
        clearable
        :loading="autoFetch && loading"
        style="width: 280px;"
        @input="handleSearchInput"
        @clear="handleSearchClear">
        <template #prefix>
          <NIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </NIcon>
        </template>
      </NInput>
    </div>

    <NSpin :show="loading">
      <div class="groups-grid">
        <div v-if="displayedGroups.length === 0 && !loading" class="empty-state">
          <NIcon size="64" :depth="3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </NIcon>
          <p class="empty-text">{{ t('circle.noCircles') }}</p>
          <p class="empty-hint">{{ t('circle.createCircle') }}</p>
        </div>
        <NCard
          v-for="group in displayedGroups"
          :key="group.id"
          class="group-card"
          :bordered="false"
          hoverable
          @click="handleClick(group)">
          <div class="group-info">
            <NAvatar round :size="60" :src="group.avatar">
              <div v-if="!group.avatar">{{ (group.name || '').charAt(0) }}</div>
            </NAvatar>
            <h3 class="group-name">{{ group.name }}</h3>
            <span class="group-stat">
              <NIcon size="14">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
              </NIcon>
              {{ formatNumber(group.members) }}
            </span>
          </div>
        </NCard>
        <!-- 无限滚动哨兵：仅在自动拉取模式下生效 -->
        <div v-if="autoFetch" ref="sentinel" class="scroll-sentinel"></div>
      </div>
    </NSpin>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NAvatar, NIcon, NInput, NSpin, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useFormatNumber } from '@/utils/i18n'
import { getMyCircles } from '@/api/post'

const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const { formatNumber } = useFormatNumber()

const props = defineProps({
  // 外部注入的圈子数据（兜底/无接口场景，如查看他人主页时的 mock）
  groups: {
    type: Array,
    default: () => []
  },
  // 自动拉取模式：开启后组件自行调用 /circle/my（服务端搜索 + 游标分页 + 无限滚动）。
  // 默认 false 以保持对旧调用方（外部传 groups）的兼容。
  autoFetch: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'total-change'])

const searchKey = ref('')
const loading = ref(false)

// === 自动拉取模式状态（与 MyPosts 保持一致的分页结构）===
const PAGE_SIZE = 20
const circles = ref([])
const searchAfter = ref('')
const hasMore = ref(false)
const sentinel = ref(null)
let searchTimer = null
let observer = null

// 后端 snake_case → 组件 camelCase
// /circle/my 仅返回：id / name / avatar_url / member_count
const transformCircle = (c) => ({
  id: c.id,
  name: c.name || t('circle.interestCircle'),
  avatar: c.avatar_url || '',
  members: c.member_count || 0
})

// 拉取圈子：append=true 表示追加下一页
const fetchCircles = async (append = false) => {
  if (loading.value) return
  loading.value = true
  try {
    const params = { size: PAGE_SIZE }
    if (searchKey.value) params.keyword = searchKey.value
    if (append && searchAfter.value) {
      params.search_after = searchAfter.value
    }

    const res = await getMyCircles(params)
    const data = res.data || {}
    const list = (data.circles || []).map(transformCircle)
    circles.value = append ? [...circles.value, ...list] : list

    searchAfter.value = data.search_after || ''
    hasMore.value = !!data.search_after

    // 仅首页（含新搜索）上报命中总数，供父组件展示 Tab 计数
    if (!append) {
      emit('total-change', data.total || circles.value.length)
    }
  } catch (error) {
    console.error('获取圈子列表失败:', error)
    message.error(error.message || t('common.operationFailed'))
  } finally {
    loading.value = false
  }
}

// === 搜索 ===
// 自动拉取模式：服务端关键字匹配（防抖）；外部数据模式：本地过滤
const handleSearchInput = () => {
  if (!props.autoFetch) return
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchAfter.value = ''
    hasMore.value = false
    fetchCircles(false)
  }, 500)
}

const handleSearchClear = () => {
  if (!props.autoFetch) return
  if (searchTimer) clearTimeout(searchTimer)
  searchAfter.value = ''
  hasMore.value = false
  fetchCircles(false)
}

// 外部数据模式的本地过滤
const filteredGroups = computed(() => {
  if (!searchKey.value) return props.groups
  const key = searchKey.value.toLowerCase()
  return props.groups.filter(group =>
    (group.name || '').toLowerCase().includes(key)
  )
})

// 实际渲染列表：自动拉取用 circles，否则用外部传入数据
const displayedGroups = computed(() => (props.autoFetch ? circles.value : filteredGroups.value))

// === 无限滚动（仅自动拉取模式）===
const setupObserver = () => {
  if (!props.autoFetch) return
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (!sentinel.value || !hasMore.value || loading.value) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value && !loading.value) {
        fetchCircles(true)
      }
    },
    { rootMargin: '200px' }
  )
  observer.observe(sentinel.value)
}

watch([sentinel, hasMore, loading], setupObserver)

// 点击圈子：跳转圈子详情，同时上抛 click 供父组件兜底
const handleClick = (group) => {
  emit('click', group)
  if (group && group.id) {
    router.push(`/circle/${group.id}`)
  }
}

onMounted(() => {
  if (props.autoFetch) {
    nextTick(() => fetchCircles(false))
  }
})
</script>

<style scoped>
.my-groups-tab {
  padding: 8px 0;
}

.tab-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  margin-right: 3dvw;
  gap: 16px;
}

.tab-title {
  font-size: 1.5rem;
  margin-right: 3dvw;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

/* 每行 3 个圈子卡片（紧凑）*/
.groups-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.group-card {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
}

.group-card:hover {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  transform: translateY(-4px);
}

.group-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 12px;
  text-align: center;
}

/* 无头像时回退首字母样式（参考 CircleList）*/
.group-info :deep(.n-avatar) {
  color: #fff;
  font-weight: 700;
  font-size: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.group-name {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.group-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.scroll-sentinel {
  grid-column: 1 / -1;
  height: 1px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  grid-column: 1 / -1;
}

.empty-text {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 16px 0 4px 0;
}

.empty-hint {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* 响应式 */
@media (max-width: 1024px) {
  .groups-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .groups-grid {
    grid-template-columns: 1fr;
  }

  .tab-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
