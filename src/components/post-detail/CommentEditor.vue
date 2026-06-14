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
        <NImageGroup>
          <div class="image-wall-grid">
            <div v-for="(url, idx) in uploadedImages" :key="'img-' + idx" class="image-wall-item">
              <NImage
                :src="url"
                width="80"
                height="80"
                object-fit="cover"
                lazy
                preview-src=""
                :style="{ borderRadius: '6px' }"
              />
              <button class="image-wall-remove" @click="removeImage(idx)" title="删除图片">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div v-for="n in uploadingCount" :key="'loading-' + n" class="image-wall-item image-wall-loading">
              <NSpin :size="20" />
            </div>
          </div>
        </NImageGroup>
        <span class="image-wall-count">{{ uploadedImages.length + uploadingCount }} / {{ MAX_COMMENT_IMAGES }}</span>
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
import { NCard, NButton, NImage, NImageGroup, NIcon, NSpin, useMessage } from 'naive-ui'
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
const uploading = ref(false)
const uploadingCount = ref(0)
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

.image-wall-grid {
  display: flex;
  gap: 8px;
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
  width: 18px;
  height: 18px;
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
  /* background-color: #77ffbdd0; */
}

.image-wall-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
  margin-left: 12px;
}

.image-wall-loading {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
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
