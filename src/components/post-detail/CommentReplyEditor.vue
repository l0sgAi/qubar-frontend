<template>
  <div class="reply-editor">
    <MdEditor
      v-model="content"
      :language="language"
      :preview="false"
      :toolbars="toolbars"
      theme="dark"
      :placeholder="replyToName ? `@${t('comment.reply.placeholder', { name: replyToName })}` : t('comment.editor.placeholder')"
      :max-length="2000"
      :footers="[]"
      :style="{ height: '17dvh' }"
    />
    <!-- 图片预览照片墙 -->
    <div v-if="uploadedImages.length || uploading" class="image-wall">
      <UploadImageWall
        :images="uploadedImages"
        :uploading="uploading"
        :uploading-count="uploadingCount"
        :max-count="MAX_COMMENT_IMAGES"
        :thumb-size="64"
        :gap="6"
        :progress="progress"
        @remove="removeImage"
      />
    </div>
    <div class="reply-editor-footer">
      <div class="footer-left">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          multiple
          style="display: none"
          @change="handleFileSelect"
        />
        <NButton
          quaternary
          size="small"
          :title="t('comment.editor.uploadImage')"
          :disabled="uploadedImages.length >= MAX_COMMENT_IMAGES || uploading"
          @click="fileInputRef.click()"
        >
          <template #icon>
            <NIcon size="16">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </NIcon>
          </template>
        </NButton>
        <!-- @提及：选人传 uuid -->
        <MentionPicker :selected-ids="mentionedUsers.map(u => u.id)" :icon-size="16" @select="handleMentionSelect" />
      </div>
      <div class="footer-right">
        <NButton size="small" quaternary @click="$emit('cancel')">{{ t('common.cancel') }}</NButton>
        <NButton
          type="primary"
          size="small"
          round
          :disabled="!content.trim() && !uploadedImages.length"
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ t('comment.actions.reply') }}
        </NButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NButton, NIcon, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { createComment } from '@/api/comment'
import { getUserInfo } from '@/api/auth'
import { useImageUpload } from '@/composables/useImageUpload'
import UploadImageWall from '@/components/UploadImageWall.vue'
import MentionPicker from '@/components/MentionPicker.vue'
import { auth } from '@/utils/auth'
import { requireLogin } from '@/utils/guest-action'

const props = defineProps({
  postId: {
    type: String,
    required: true
  },
  rootId: {
    type: String,
    default: null
  },
  replyToId: {
    type: String,
    required: true
  },
  replyToName: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'zh-CN'
  }
})

const emit = defineEmits(['submit', 'cancel'])

const { t } = useI18n()
const message = useMessage()
const content = ref('')
const submitting = ref(false)
const { uploading, uploadingCount, progress, uploadMany } = useImageUpload({ withProgress: true })
const uploadedImages = ref([])
const fileInputRef = ref(null)

// @提及：已选用户（提交时过滤正文中仍存在的 @用户名，取 uuid 传后端）
const mentionedUsers = ref([])

const handleMentionSelect = (user) => {
  mentionedUsers.value.push(user)
  content.value = `${content.value}@${user.username} `
}

const MAX_COMMENT_IMAGES = 5

const toolbars = [
  'bold',
  'italic',
  '_',
  '-',
  'preview'
]

const removeImage = (idx) => {
  uploadedImages.value.splice(idx, 1)
}

const handleSubmit = async () => {
  // 访客发回复前置拦截：弹登录引导
  if (!auth.isAuthenticated()) {
    requireLogin('comment')
    return
  }
  if ((!content.value.trim() && !uploadedImages.value.length) || submitting.value) return
  submitting.value = true
  try {
    const extraData = uploadedImages.value.length > 0 ? { images: [...uploadedImages.value] } : null
    // 正文里被删掉的 @ 不传；后端对重复/@自己/不存在用户会静默过滤
    const mentionIds = mentionedUsers.value
      .filter(u => content.value.includes(`@${u.username}`))
      .map(u => u.id)
    const res = await createComment({
      post_id: props.postId,
      root_id: props.rootId ?? props.replyToId,
      reply_to_id: props.replyToId,
      content: content.value,
      extra_data: extraData,
      mention_user_ids: mentionIds.length ? mentionIds : undefined
    })
    message.success(t('comment.reply.success'))

    let userData = {}
    try {
      const userRes = await getUserInfo()
      if (userRes.data) {
        userData = userRes.data
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }

    const newReply = typeof res.data === 'object' && res.data !== null
      ? { ...res.data }
      : { id: res.data }

    newReply.author_name = userData.name || newReply.author_name || ''
    newReply.author_id = userData.id || newReply.author_id
    newReply.author_avatar = userData.avatar_url || newReply.author_avatar || null
    newReply.content = newReply.content || content.value
    newReply.like_count = newReply.like_count || 0
    newReply.reply_to_name = newReply.reply_to_name || props.replyToName || null
    newReply.create_time = newReply.create_time || new Date().toISOString()
    if (extraData) {
      newReply.extra_data = extraData
    }

    content.value = ''
    uploadedImages.value = []
    mentionedUsers.value = []
    emit('submit', newReply)
  } catch (err) {
    message.error(err.message || t('comment.reply.failed'))
  } finally {
    submitting.value = false
  }
}

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files || [])
  if (!files.length) return
  uploadFiles(files)
  e.target.value = ''
}

const uploadFiles = async (files) => {
  if (uploadedImages.value.length >= MAX_COMMENT_IMAGES) {
    message.warning(t('upload.maxImages', { max: MAX_COMMENT_IMAGES }))
    return
  }
  const remaining = MAX_COMMENT_IMAGES - uploadedImages.value.length
  const filesToUpload = files.slice(0, remaining)
  if (filesToUpload.length < files.length) {
    message.warning(t('upload.exceedLimit', { remaining }))
  }
  try {
    const urls = await uploadMany(filesToUpload)
    uploadedImages.value = [...uploadedImages.value, ...urls]
    message.success(t('upload.success'))
  } catch (error) {
    console.error('图片上传失败:', error)
    message.error(t('upload.failed'))
  }
}
</script>

<style scoped>
.reply-editor {
  margin-top: 10px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.reply-editor :deep(.md-editor) {
  border: none !important;
  border-radius: 0 !important;
}

.reply-editor :deep(.md-editor-toolbar-wrapper) {
  border-radius: 0;
}

.reply-editor :deep(.md-editor-content) {
  border-bottom: none !important;
}

.image-wall {
  padding: 6px 10px;
  background: rgb(24, 24, 28);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reply-editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: rgb(24, 24, 28);
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.md-editor-dark) {
  --md-bk-color: rgb(24, 24, 28);
  --md-scrollbar-bg-color: rgb(24, 24, 28);
}
</style>
