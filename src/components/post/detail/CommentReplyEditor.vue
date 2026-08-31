<template>
  <div class="reply-editor">
    <MdEditor
      ref="replyEditorRef"
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
        <!-- @提及：按钮选人 + 编辑器内输入 @ 触发选人，共用同一份已选列表 -->
        <MentionPicker :selected-ids="selectedIds" :icon-size="16" @select="appendAtEnd" />
        <MentionTrigger
          :get-editor-view="getReplyEditorView"
          :selected-ids="selectedIds"
          @select="recordSelection"
        />
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
import MentionTrigger from '@/components/MentionTrigger.vue'
import { useMentions } from '@/composables/useMentions'
import { ensureMentionHighlight } from '@/utils/mentionHighlight'
import { auth } from '@/utils/auth'
import { filterMentionedIds } from '@/utils/mention'
import { requireLogin } from '@/utils/guest-action'
import { seedContentMentions } from '@/utils/mentionResolve'

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

// @提及：按钮选人与正文内输入 @ 触发选人，共用同一份已选列表与 10 人上限；
// 提交时 filterMentionedIds 过滤出正文中仍存在的 token 对应 uuid 传后端
const replyEditorRef = ref(null)
const getReplyEditorView = () => {
  const view = replyEditorRef.value?.getEditorView?.()
  if (view) ensureMentionHighlight(view)
  return view
}
const { mentionedUsers, selectedIds, recordSelection, appendAtEnd, clearMentioned } = useMentions({
  getText: () => content.value,
  setText: v => { content.value = v }
})

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
    // 正文里被删掉的 @ 不传；须为完整 @用户名 token（@alice 不命中 @alice2）；
    // 后端对重复/@自己/不存在用户会静默过滤
    const mentionIds = filterMentionedIds(content.value, mentionedUsers.value)
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

    // 后端若回传 mentions，乐观渲染前回灌
    seedContentMentions([newReply])

    content.value = ''
    uploadedImages.value = []
    clearMentioned()
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
