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
      <NImageGroup>
        <div class="image-wall-grid">
          <div v-for="(url, idx) in uploadedImages" :key="'img-' + idx" class="image-wall-item">
            <NImage
              :src="url"
              width="64"
              height="64"
              object-fit="cover"
              lazy
              preview-src=""
              :style="{ borderRadius: '6px' }"
            />
            <button class="image-wall-remove" @click="removeImage(idx)" title="删除图片">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div v-for="n in uploadingCount" :key="'loading-' + n" class="image-wall-item image-wall-loading">
            <NSpin :size="18" />
          </div>
        </div>
      </NImageGroup>
      <span class="image-wall-count">{{ uploadedImages.length + uploadingCount }} / {{ MAX_COMMENT_IMAGES }}</span>
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
import { NButton, NImage, NImageGroup, NIcon, NSpin, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { createComment } from '@/api/comment'
import { getUserInfo } from '@/api/auth'
import { uploadImage } from '@/api/user'

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
const uploading = ref(false)
const uploadingCount = ref(0)
const uploadedImages = ref([])
const fileInputRef = ref(null)

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
  if ((!content.value.trim() && !uploadedImages.value.length) || submitting.value) return
  submitting.value = true
  try {
    const extraData = uploadedImages.value.length > 0 ? { images: [...uploadedImages.value] } : null
    const res = await createComment({
      post_id: props.postId,
      root_id: props.rootId ?? props.replyToId,
      reply_to_id: props.replyToId,
      content: content.value,
      extra_data: extraData
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
    message.warning(`评论最多上传 ${MAX_COMMENT_IMAGES} 张图片`)
    return
  }
  const remaining = MAX_COMMENT_IMAGES - uploadedImages.value.length
  const filesToUpload = files.slice(0, remaining)
  if (filesToUpload.length < files.length) {
    message.warning(`已超出上限，仅上传前 ${remaining} 张`)
  }
  uploadingCount.value = filesToUpload.length
  uploading.value = true
  try {
    const urls = []
    for (const file of filesToUpload) {
      const res = await uploadImage(file)
      if (res.data && res.data.url) {
        urls.push(res.data.url)
      } else if (res.data) {
        urls.push(res.data)
      }
    }
    uploadedImages.value = [...uploadedImages.value, ...urls]
    message.success('图片上传成功')
  } catch (error) {
    console.error('图片上传失败:', error)
    message.error('图片上传失败，请重试')
  } finally {
    uploading.value = false
    uploadingCount.value = 0
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

.image-wall-grid {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.image-wall-item {
  position: relative;
  line-height: 0;
}

.image-wall-remove {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 77, 79, 0.9);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  padding: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-wall-item:hover .image-wall-remove {
  opacity: 1;
}

.image-wall-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
  margin-left: 10px;
}

.image-wall-loading {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
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
