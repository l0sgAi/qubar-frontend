<template>
  <SmartLink class="trending-card" :class="`type-${type}`" :to="targetUrl">
    <!-- 排名徽章：Top 1/2/3 特殊配色，其余灰底 -->
    <div class="rank-badge" :class="{ 'rank-top': rank <= 3 }" :style="rankStyle">
      {{ rank }}
    </div>

    <!-- 头像 -->
    <div class="avatar-wrap">
      <NAvatar round :size="44" :src="avatarUrl" :style="!avatarUrl ? { background: avatarBg } : null">
        <span v-if="!avatarUrl" class="avatar-fallback">{{ fallbackChar }}</span>
      </NAvatar>
    </div>

    <!-- 文案 -->
    <div class="card-body">
      <div class="primary">{{ primary }}</div>
      <div v-if="secondary" class="secondary">{{ secondary }}</div>
    </div>

    <!-- 热度 -->
    <div class="hot-score">
      <span class="fire">🔥</span>
      <span>{{ formatNumber(item.hot_score) }}</span>
    </div>
  </SmartLink>
</template>

<script setup>
import { computed } from 'vue'
import { NAvatar } from 'naive-ui'
import { useFormatNumber } from '@/utils/i18n'
import SmartLink from '@/components/SmartLink.vue'

const props = defineProps({
  // 条目类型：post | circle | user
  type: {
    type: String,
    required: true,
    validator: (v) => ['post', 'circle', 'user'].includes(v)
  },
  // 排名（从 1 开始）
  rank: {
    type: Number,
    required: true
  },
  // 原始 API 条目（snake_case）
  item: {
    type: Object,
    required: true
  }
})

const { formatNumber } = useFormatNumber()

// 跳转目标：按类型归一到真实 URL，交给 SmartLink 渲染 <a href>
const targetUrl = computed(() => {
  const id = props.item.id
  if (!id) return null
  return {
    post: `/post/${id}`,
    circle: `/circle/${id}`,
    user: `/user/${id}`
  }[props.type]
})

// 头像 URL：post 取作者头像，circle/user 取 avatar_url
const avatarUrl = computed(() => {
  if (props.type === 'post') return props.item.author_avatar || ''
  return props.item.avatar_url || ''
})

// 主题色背景（无头像时的首字母占位），用 type 区分色调
const avatarBg = computed(() => {
  return {
    post: 'linear-gradient(135deg, #ec4899, #a855f7)',
    circle: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    user: 'linear-gradient(135deg, #a855f7, #6366f1)'
  }[props.type]
})

const fallbackChar = computed(() => {
  return (primary.value || '?').charAt(0)
})

// 主标题：post=标题，circle=圈子名，user=昵称
const primary = computed(() => {
  if (props.type === 'post') return props.item.title || ''
  if (props.type === 'circle') return props.item.name || ''
  return props.item.username || ''
})

// 副标题
const secondary = computed(() => {
  if (props.type === 'post') {
    const segs = [props.item.author_name, props.item.circle_name].filter(Boolean)
    return segs.length ? segs.join(' · ') : ''
  }
  if (props.type === 'circle') {
    return `${formatNumber(props.item.member_count)} 成员 · ${formatNumber(props.item.post_count)} 帖`
  }
  // user 无额外字段
  return ''
})

// Top 1/2/3 徽章配色
const rankStyle = computed(() => {
  const colors = {
    1: 'linear-gradient(135deg, #f59e0b, #ef4444)', // 金红
    2: 'linear-gradient(135deg, #9ca3af, #6b7280)', // 银
    3: 'linear-gradient(135deg, #d97706, #b45309)'  // 铜
  }
  return colors[props.rank] || null
})
</script>

<style scoped>
.trending-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
}

.trending-card:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.14);
  transform: translateY(-1px);
}

/* 排名徽章 */
.rank-badge {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.06);
}

.rank-badge.rank-top {
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 头像 */
.avatar-wrap {
  flex-shrink: 0;
}

.avatar-fallback {
  color: #fff;
  font-weight: 600;
  font-size: 16px;
}

/* 文案 */
.card-body {
  flex: 1;
  min-width: 0;
}

.primary {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.secondary {
  margin-top: 3px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 热度 */
.hot-score {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 600;
  color: #f59e0b;
}

.hot-score .fire {
  font-size: 14px;
}
</style>
