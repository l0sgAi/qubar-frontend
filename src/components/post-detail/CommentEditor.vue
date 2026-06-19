<template>
  <NCard :bordered="false" class="comment-editor-card">
    <div class="comment-editor-header">
      <span class="comment-section-title">{{ t('comment.editor.title') }}</span>
    </div>
    <div class="comment-editor-wrapper">
      <MdEditor
        v-model="content"
        :language="language"
        :preview="false"
        :toolbars="toolbars"
        theme="dark"
        :placeholder="t('comment.editor.placeholder')"
        :max-length="2000"
        :footers="[]"
        :style="{ height: '25dvh' }"
      />
      <!-- 图片预览照片墙 -->
      <div v-if="uploadedImages.length || uploading" class="image-wall">
        <UploadImageWall
          :images="uploadedImages"
          :uploading="uploading"
          :uploading-count="uploadingCount"
          :max-count="MAX_COMMENT_IMAGES"
          :progress="progress"
          @remove="removeImage"
        />
      </div>
      <div class="comment-editor-footer">
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
              <NIcon size="18">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </NIcon>
            </template>
          </NButton>
        </div>
        <NButton
          type="primary"
          size="medium"
          round
          :disabled="!content.trim() && !uploadedImages.length"
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ t('comment.editor.submit') }}
        </NButton>
      </div>
    </div>
  </NCard>
</template>

<script setup>
import { ref, watch } from 'vue'
import { NCard, NButton, NIcon, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { createComment } from '@/api/comment'
import { getUserInfo } from '@/api/auth'
import { useImageUpload } from '@/composables/useImageUpload'
import UploadImageWall from '@/components/UploadImageWall.vue'

const props = defineProps({
  postId: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'zh-CN'
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const { t } = useI18n()
const message = useMessage()
const content = ref(props.modelValue)
const submitting = ref(false)
const { uploading, uploadingCount, progress, uploadMany } = useImageUpload({ withProgress: true })
const uploadedImages = ref([])
const fileInputRef = ref(null)

const MAX_COMMENT_IMAGES = 5

watch(() => props.modelValue, (val) => {
  content.value = val
})

watch(content, (val) => {
  emit('update:modelValue', val)
})

const toolbars = [
  'bold',
  'italic',
  '-',
  'quote',
  'unorderedList',
  'orderedList',
  '-',
  'codeRow',
  'link',
  'emoji',
  '-',
  'preview',
  'previewOnly'
]

const removeImage = (idx) => {
  uploadedImages.value.splice(idx, 1)
}

const handleSubmit = async () => {
  if ((!content.value.trim() && !uploadedImages.value.length) || submitting.value) return
  submitting.value = true
  try {
    const extraData = uploadedImages.value.length > 0 ? { images: [...uploadedImages.value] } : null
    const res = await createComment({
      post_id: props.postId,
      content: content.value,
      extra_data: extraData
    })
    message.success(t('comment.editor.success'))

    let userData = {}
    try {
      const userRes = await getUserInfo()
      if (userRes.data) {
        userData = userRes.data
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }

    const newComment = typeof res.data === 'object' && res.data !== null
      ? { ...res.data }
      : { id: res.data }

    newComment.author_name = userData.name || newComment.author_name || ''
    newComment.author_id = userData.id || newComment.author_id
    newComment.author_avatar = userData.avatar_url || newComment.author_avatar || null
    newComment.content = newComment.content || content.value
    newComment.like_count = newComment.like_count || 0
    newComment.reply_count = newComment.reply_count || 0
    newComment.create_time = newComment.create_time || new Date().toISOString()
    if (extraData) {
      newComment.extra_data = extraData
    }

    emit('submit', newComment)
    content.value = ''
    uploadedImages.value = []
  } catch (err) {
    message.error(err.message || t('comment.editor.failed'))
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
.comment-editor-card {
  border-radius: 16px !important;
}

.comment-section-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.comment-editor-header {
  margin-bottom: 12px;
}

.comment-editor-wrapper {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-editor-wrapper :deep(.md-editor) {
  border: none !important;
  border-radius: 0 !important;
}

.comment-editor-wrapper :deep(.md-editor-toolbar-wrapper) {
  border-radius: 0;
}

.comment-editor-wrapper :deep(.md-editor-content) {
  border-bottom: none !important;
}

.image-wall {
  padding: 8px 12px;
  background: rgb(24, 24, 28);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgb(24, 24, 28);
}

.footer-left {
  display: flex;
  align-items: center;
}

:deep(.md-editor-dark) {
  --md-bk-color: rgb(24, 24, 28);
  --md-scrollbar-bg-color: rgb(24, 24, 28);
}
</style>
