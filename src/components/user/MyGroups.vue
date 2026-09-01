<template>
  <div class="my-groups-tab">
    <div class="tab-header">
      <h2 class="tab-title">{{ t('user.myGroups') }}</h2>
      <NInput
        v-model:value="searchKey"
        :placeholder="t('circle.interestCircle')"
        clearable
        round
        style="width: 280px;"
        @keyup.enter="handleSearch"
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
      <NButton round @click="handleSearch">
        <template #icon>
          <NIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </NIcon>
        </template>
        {{ t('common.search') }}
      </NButton>
    </div>

    <NSpin :show="loading">
      <div class="groups-grid" :class="{ 'groups-grid--loading': loading && !displayedGroups.length }">
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
          <!-- 查看他人主页时不展示「创建圈子」引导 -->
          <p v-if="!userId" class="empty-hint">{{ t('circle.createCircle') }}</p>
        </div>
        <NCard
          v-for="group in displayedGroups"
          :key="group.id"
          class="group-card"
          :bordered="false"
          hoverable>
          <!-- 整卡封面链接（stretched-link）：铺满卡片承担圈子跳转，
               右键/中键可新标签页打开 -->
          <SmartLink class="post-cover-link" :to="`/circle/${group.id}`" :aria-label="group.name" />
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
        <!-- 无限滚动哨兵：仅在拉取模式下生效 -->
        <div v-if="isFetchMode" ref="sentinel" class="scroll-sentinel"></div>
        <!-- 搜索模式被截断提示（扫满上限仍未集齐 size 条，可能还有更深的命中）-->
        <div v-if="truncated" class="truncated-hint">
          {{ t('circle.resultsMayBeIncomplete') }}
        </div>
      </div>
    </NSpin>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { NCard, NAvatar, NIcon, NInput, NButton, NSpin, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useFormatNumber } from '@/utils/i18n'
import { getMyCircles, getUserCircles } from '@/api/post'
import SmartLink from '@/components/common/SmartLink.vue'

const message = useMessage()
const { t } = useI18n()
const { formatNumber } = useFormatNumber()

const props = defineProps({
  // 外部注入的圈子数据（兜底/无接口场景）
  groups: {
    type: Array,
    default: () => []
  },
  // 自动拉取模式：开启后组件自行调用 /circle/my（服务端搜索 + 游标分页 + 无限滚动）。
  // 默认 false 以保持对旧调用方（外部传 groups）的兼容。
  autoFetch: {
    type: Boolean,
    default: false
  },
  // 目标用户 ID：
  // - 为空：查看「我加入的圈子」，走 /circle/my（autoFetch=true 时生效）
  // - 传值：查看该用户加入的圈子，走 /circle/user?user_id=...（任意已登录用户均可查看）
  //        传值后强制进入自动拉取模式，忽略外部 groups。
  userId: {
    type: String,
    default: ''
  },
  // 当前 Tab 是否激活：离开时清空关键字搜索，切回即为干净的全量列表
  active: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['total-change'])

const searchKey = ref('')
const loading = ref(false)

// 是否走接口拉取：查看他人（userId）或我的圈子（autoFetch）
const isFetchMode = computed(() => props.autoFetch || !!props.userId)

// === 自动拉取模式状态（与 MyPosts 保持一致的分页结构）===
const PAGE_SIZE = 20
const circles = ref([])
const searchAfter = ref('')
const hasMore = ref(false)
const sentinel = ref(null)
// 搜索模式可能被服务端截断（扫满上限仍未集齐 size 条）
const truncated = ref(false)
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
// 数据源由 userId 决定 —— /circle/user?user_id=（他人）或 /circle/my（我的）
const fetchCircles = async (append = false) => {
  if (loading.value) return
  loading.value = true
  try {
    const params = { size: PAGE_SIZE }
    if (searchKey.value) params.keyword = searchKey.value
    if (append && searchAfter.value) {
      // 游标原样透传，不解析/不修改（base64 不透明串）
      params.search_after = searchAfter.value
    }

    const res = props.userId
      ? await getUserCircles(props.userId, params)
      : await getMyCircles(params)

    const data = res.data || {}
    const list = (data.circles || []).map(transformCircle)
    circles.value = append ? [...circles.value, ...list] : list

    searchAfter.value = data.search_after || ''
    hasMore.value = !!data.search_after
    truncated.value = !!data.truncated

    // 仅在「非追加 + 无关键字」时上报真实总数，避免搜索结果数污染 Tab 徽标
    if (!append && !searchKey.value) {
      emit('total-change', data.total || 0)
    }
  } catch (error) {
    console.error('获取圈子列表失败:', error)
    message.error(error.message || t('common.operationFailed'))
  } finally {
    loading.value = false
  }
}

// 重置列表并从首页重新拉取（切换目标用户 / 离开 Tab 清搜索时使用）
const resetAndFetch = () => {
  searchKey.value = ''
  searchAfter.value = ''
  hasMore.value = false
  truncated.value = false
  circles.value = []
  fetchCircles(false)
}

// === 搜索 ===
// 自动拉取模式：服务端关键字匹配（按钮 / 回车主动触发）；外部数据模式：本地过滤（响应式）
const handleSearch = () => {
  if (!isFetchMode.value) return
  searchAfter.value = ''
  hasMore.value = false
  fetchCircles(false)
}

const handleSearchClear = () => {
  if (!isFetchMode.value) return
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

// 实际渲染列表：拉取模式用 circles，否则用外部传入数据
const displayedGroups = computed(() => (isFetchMode.value ? circles.value : filteredGroups.value))

// === 无限滚动（仅拉取模式）===
const setupObserver = () => {
  if (!isFetchMode.value) return
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

// 切换目标用户（路由参数变化）时重置并重新拉取首页
watch(() => props.userId, (next, prev) => {
  if (next !== prev) resetAndFetch()
})

// 离开本 Tab：若存在关键字搜索则清空。
// 接口模式需重新拉取全量首页；外部数据模式仅清关键字（filteredGroups 自动反应）
watch(() => props.active, (next, prev) => {
  if (prev && !next && searchKey.value) {
    if (isFetchMode.value) {
      resetAndFetch()
    } else {
      searchKey.value = ''
    }
  }
})

// 圈子跳转已由卡片封面链接（SmartLink）承担：真实 <a href>，
// 支持 hover URL / 右键新标签页；此处不再监听点击（旧版 emit+push 会双跳转）

onMounted(() => {
  if (isFetchMode.value) {
    nextTick(() => fetchCircles(false))
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
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

/* 加载占位：列表为空时撑高容器，避免 NSpin 动画被裁剪、页面收缩跳动 */
.groups-grid--loading {
  min-height: 320px;
}

.group-card {
  position: relative;
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 16px !important;
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
}

.group-card:hover {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  transform: translateY(-4px);
}

/* 整卡封面链接（stretched-link）：铺满卡片让浏览器在任意位置识别出圈子链接 */
.post-cover-link {
  position: absolute;
  inset: 0;
  z-index: 1;
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

/* 修正首字母居中：display-directive="show" 下兴趣圈 tab 初始 display:none 挂载，
   naive-ui NAvatar 的 fitTextTransform 首次在隐藏态测得 offsetWidth/Height=0 → ratio=NaN →
   内联 transform(scale NaN) 失效；又因 memoedTextHtml 缓存守卫，切回可见态不再重算，
   导致 .n-avatar__text 停在 left/top:50%（左上角贴圆心）→ 首字母偏到右下角。
   此处强制 translate 基于元素真实尺寸居中（CSS 百分比 translate 渲染即正确，绕过 JS 测量），
   !important 用于覆盖 naive-ui 写入的内联 transform。*/
.group-info :deep(.n-avatar__text) {
  transform: translate(-50%, -50%) !important;
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

.truncated-hint {
  grid-column: 1 / -1;
  text-align: center;
  padding: 8px 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
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
