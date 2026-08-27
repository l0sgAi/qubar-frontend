<template>
  <NCard :bordered="false" class="post-card">
    <!-- 帖子头部信息 -->
    <div class="post-header">
      <!-- 置顶、精华、状态标签 -->
      <div class="post-badges">
        <NTag v-if="post.is_pinned" type="warning" size="small" round>{{ t('post.badges.pinned') }}</NTag>
        <NTag v-if="post.is_essence" type="success" size="small" round>{{ t('post.badges.essence') }}</NTag>
        <NTag v-if="post.is_lock" type="error" size="small" round>{{ t('post.badges.locked') }}</NTag>
      </div>

      <!-- 标题 -->
      <h1 class="post-title">{{ post.title }}</h1>
      <!-- 状态标签 -->
      <NTag
        v-if="post.status !== 1"
        :type="getStatusTagType(post.status)"
        size="large"
        round
      >
        {{ getStatusText(post.status) }}
      </NTag>

      <!-- 作者信息 -->
      <div class="post-meta">
        <div class="author-info">
          <NAvatar
            round
            :size="40"
            :src="post.author_avatar || '/default-avatar.png'"
          />
          <div class="author-text">
            <div class="author-name" :class="{ clickable: post.author_id }" @click="goToUserDetail(post.author_id)">
              {{ post.author_name || t('user.anonymous') }}
            </div>
            <div class="post-time">
              {{ formatTime(post.create_time) }}
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="post-stats">
          <div class="stat-item">
            <NIcon class="stat-icon" size="18">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </NIcon>
            <span>{{ formatNumber(post.view_count, VIEW_COUNT_CAP) }}</span>
          </div>
          <div class="stat-item">
            <NIcon class="stat-icon" size="18">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </NIcon>
            <span>{{ formatNumber(post.comment_count, STATS_COUNT_CAP) }}</span>
          </div>
          <div class="stat-item">
            <NIcon class="stat-icon" size="18">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </NIcon>
            <span>{{ formatNumber(post.like_count, STATS_COUNT_CAP) }}</span>
          </div>
          <div class="stat-item">
            <NIcon class="stat-icon" size="18">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </NIcon>
            <span>{{ formatNumber(post.collect_count, STATS_COUNT_CAP) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 帖子正文（Markdown渲染 + @提及链接化） -->
    <div class="post-content">
      <MentionPreview
        :content="post.content"
        :language="language"
      />
    </div>

    <!-- 底部操作栏 -->
    <div class="post-actions">
      <NButton
        size="large"
        :type="post.is_liked ? 'primary' : 'default'"
        @click="$emit('like')"
      >
        <template #icon>
          <NIcon size="20">
            <svg v-if="!post.is_liked" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </NIcon>
        </template>
        {{ post.is_liked ? t('post.actions.liked') : t('post.actions.like') }}
      </NButton>

      <NButton
        size="large"
        :type="post.is_collected ? 'primary' : 'default'"
        @click="$emit('collect')">
        <template #icon>
          <NIcon size="20">
            <svg v-if="!post.is_collected" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </NIcon>
        </template>
        {{ post.is_collected ? t('post.actions.favorited') : t('post.actions.favorite') }}
      </NButton>

      <NButton size="large">
        <template #icon>
          <NIcon size="20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </NIcon>
        </template>
        {{ t('post.actions.share') }}
      </NButton>
    </div>

    <!-- 插槽：评论编辑器和评论列表 -->
    <slot />
  </NCard>
</template>

<script setup>
import { NCard, NTag, NAvatar, NButton, NIcon } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import MentionPreview from '@/components/MentionPreview.vue'
import { useFormatTime, useFormatNumber } from '@/utils/i18n'

defineProps({
  post: {
    type: Object,
    required: true
  },
  language: {
    type: String,
    default: 'zh-CN'
  }
})

defineEmits(['like', 'collect'])

const { t } = useI18n()
const { formatTime } = useFormatTime()
const { formatNumber } = useFormatNumber()
const router = useRouter()

const VIEW_COUNT_CAP = 1_000_000_000
const STATS_COUNT_CAP = 100_000_000

// 跳转到用户详情页
const goToUserDetail = (userId) => {
  if (userId) {
    router.push(`/user/${userId}`)
  }
}

const getStatusText = (status) => {
  const statusMap = {
    0: t('post.status.draft'),
    1: t('post.status.normal'),
    2: t('post.status.reviewing'),
    3: t('post.status.rejected'),
    4: t('post.status.blocked')
  }
  return statusMap[status] || t('post.status.normal')
}

const getStatusTagType = (status) => {
  const typeMap = {
    0: 'default',
    1: 'success',
    2: 'info',
    3: 'warning',
    4: 'error'
  }
  return typeMap[status] || 'default'
}
</script>

<style scoped>
.post-card {
  border-radius: 16px !important;
  overflow: hidden;
}

.post-header {
  /* margin-bottom: 24px; */
  padding: 24px 24px 0 24px;
}

.post-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.post-title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 16px 0;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 18px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  transition: color 0.2s;
}

.author-name.clickable {
  cursor: pointer;
}

.author-name.clickable:hover {
  color: #63e2b7;
}

.post-time {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.post-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
}

.stat-icon {
  color: rgba(255, 255, 255, 0.5);
}

.post-content {
  margin: 14px 0;
  padding: 24px;
  padding-top: 0;
  border-radius: 15px;
}

:deep(.md-editor *) {
  font-family: 'Fira Code', 'Cascadia Code', 'Maple Mono NF CN', 'JetBrains Mono', 'Source Code Pro', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'PingFang SC', 'Microsoft YaHei', monospace;
}

.post-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px 0;
}

.post-actions .n-button {
  min-width: 120px;
  border-radius: 10px;
  font-weight: 500;
}

:deep(.n-card__content) {
  padding: 32px;
}

:deep(.md-editor-dark) {
  --md-bk-color: rgb(24, 24, 28);
  --md-scrollbar-bg-color: rgb(24, 24, 28);
}

:deep(.md-editor-dark .md-editor-preview) {
  --md-theme-bg-color: rgb(24, 24, 28);
}

@media (max-width: 1200px) {
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  :deep(.n-card__content) {
    padding: 20px;
  }

  .post-title {
    font-size: 24px;
  }

  .post-stats {
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
