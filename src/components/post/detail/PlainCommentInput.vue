<template>
  <!-- 移动端纯文本评论 / 回复（见 docs/mobile-adaptation-plan.md 6.6）。
       对外契约与 CommentEditor / CommentReplyEditor 一致：传 rootId 即回复模式（额外 emit cancel）。
       不带 Markdown 工具栏、配图、@ 提及；内容仍按 Markdown 渲染，MdPreview 开启 breaks，单换行即换行 -->
  <div class="plain-comment" :class="{ 'is-reply': isReply }">
    <div v-if="!isReply" class="plain-comment-header">
      <span class="plain-comment-title">{{ t('comment.editor.title') }}</span>
    </div>

    <!-- 访客态：登录引导（与 CommentEditor 一致） -->
    <div v-if="!isLoggedIn" class="guest-prompt" @click="requireLogin('comment')">
      <NIcon size="20" :component="CommentIcon" />
      <span>{{ t('comment.editor.loginToComment') }}</span>
    </div>

    <template v-else>
      <div class="input-box">
        <NInput
          ref="inputRef"
          v-model:value="content"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 6 }"
          :maxlength="MAX_LENGTH"
          :placeholder="placeholder"
          class="plain-textarea"
        />
        <NButton
          type="primary"
          size="small"
          round
          class="send-btn"
          :disabled="!content.trim()"
          :loading="submitting"
          @click="handleSubmit"
        >
          <template #icon><NIcon><SendIcon /></NIcon></template>
          {{ t('mobile.comment.send') }}
        </NButton>
      </div>
      <div class="input-footer">
        <span class="rich-hint">{{ t('mobile.comment.richHint') }}</span>
        <NButton v-if="isReply" text size="small" @click="$emit('cancel')">{{ t('common.cancel') }}</NButton>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { NInput, NButton, NIcon, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { MessageCircle as CommentIcon, Send as SendIcon } from '@vicons/tabler'
import { useCommentSubmit } from '@/composables/useCommentSubmit'
import { auth } from '@/utils/auth'
import { requireLogin } from '@/utils/guest-action'

// 与桌面 MdEditor 的 max-length 一致
const MAX_LENGTH = 2000

const props = defineProps({
  postId: {
    type: String,
    required: true
  },
  // 回复模式：根评论 id（为 null 表示发表顶层评论）
  rootId: {
    type: String,
    default: null
  },
  // 直接回复根评论时为 null（此时用 rootId 作为 reply_to_id）
  replyToId: {
    type: String,
    default: null
  },
  replyToName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit', 'cancel'])

const { t } = useI18n()
const message = useMessage()
const { submitting, submit } = useCommentSubmit()

const isLoggedIn = computed(() => auth.isAuthenticated())
const isReply = computed(() => props.rootId !== null)
const content = ref('')
const inputRef = ref(null)

const placeholder = computed(() => (isReply.value && props.replyToName
  ? t('mobile.comment.replyPlaceholder', { name: props.replyToName })
  : t('mobile.comment.placeholder')))

// 回复框由「回复」按钮展开，展开即聚焦（顶层评论框不自动聚焦，避免进页面就弹键盘）
onMounted(async () => {
  if (isReply.value && isLoggedIn.value) {
    await nextTick()
    inputRef.value?.focus()
  }
})

const handleSubmit = async () => {
  if (!isLoggedIn.value) {
    requireLogin('comment')
    return
  }
  if (!content.value.trim() || submitting.value) return
  try {
    const created = await submit({
      postId: props.postId,
      content: content.value,
      reply: isReply.value
        ? { rootId: props.rootId, replyToId: props.replyToId, replyToName: props.replyToName }
        : null
    })
    message.success(t(isReply.value ? 'comment.reply.success' : 'comment.editor.success'))
    content.value = ''
    emit('submit', created)
  } catch (err) {
    message.error(err.message || t(isReply.value ? 'comment.reply.failed' : 'comment.editor.failed'))
  }
}
</script>

<style scoped>
.plain-comment {
  padding: 16px;
  border-radius: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
}

.plain-comment.is-reply {
  margin-top: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
}

.plain-comment-header {
  margin-bottom: 12px;
}

.plain-comment-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.guest-prompt {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.guest-prompt:active {
  border-color: rgba(102, 234, 194, 0.4);
  background: rgba(102, 234, 194, 0.08);
  color: #66eac2;
}

.input-box {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.plain-textarea {
  flex: 1;
  /* ≥ 16px：iOS 聚焦输入框时不自动缩放页面 */
  --n-font-size: 16px !important;
  font-size: 16px;
}

.send-btn {
  flex-shrink: 0;
  height: 34px;
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  min-height: 20px;
}

.rich-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}
</style>
