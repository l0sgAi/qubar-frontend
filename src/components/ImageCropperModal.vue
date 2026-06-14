<template>
  <NModal
    :show="show"
    @update:show="(v) => emit('update:show', v)"
    preset="card"
    :style="{ width: '640px', borderRadius: '24px' }"
    :title="title"
    :bordered="false"
    size="huge"
    :mask-closable="false"
    :segmented="{ content: 'soft' }"
  >
    <div class="cropper-wrapper">
      <img ref="imgEl" :src="imageSrc" class="cropper-img" />
    </div>

    <template #footer>
      <NSpace justify="space-between" align="center">
        <NSpace :size="8">
          <NButton quaternary round @click="handleReset">
            {{ t('circle.form.cropReset') }}
          </NButton>
          <NButton quaternary round :type="previewVisible ? 'primary' : undefined" @click="togglePreview">
            {{ t('circle.form.previewButton') }}
          </NButton>
        </NSpace>
        <NSpace :size="12">
          <NButton round @click="handleCancel">{{ t('common.cancel') }}</NButton>
          <NButton type="primary" round :loading="confirming" @click="handleConfirm">
            {{ t('circle.form.cropConfirm') }}
          </NButton>
        </NSpace>
      </NSpace>
    </template>
  </NModal>

  <!-- 效果预览抽屉：与裁剪弹窗并存，实时反映裁剪结果在圈子头部的展示效果 -->
  <NDrawer
    v-model:show="previewVisible"
    placement="right"
    :width="400"
    :show-mask="false"
    :auto-focus="false"
    :close-on-esc="true"
  >
    <NDrawerContent :title="t('circle.form.previewTitle')" closable>
      <p class="preview-hint">{{ t('circle.form.previewHint') }}</p>
      <CircleHeaderPreview
        :cover-url="previewCover"
        :avatar-url="previewAvatar"
        :name="circleName"
        :slug="slug"
      />
    </NDrawerContent>
  </NDrawer>
</template>

<script setup>
import { ref, watch, nextTick, computed, onBeforeUnmount } from 'vue'
import { NModal, NButton, NSpace, NDrawer, NDrawerContent, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import Cropper from 'cropperjs'
import CircleHeaderPreview from '@/components/CircleHeaderPreview.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  imageSrc: { type: String, default: '' },
  aspectRatio: { type: Number, default: 1 },
  title: { type: String, default: '' },
  // 效果预览相关
  type: { type: String, default: 'avatar' }, // 'avatar' | 'cover'
  circleName: { type: String, default: '' },
  coverUrl: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  slug: { type: String, default: '' }
})
const emit = defineEmits(['update:show', 'confirm', 'cancel'])

const { t } = useI18n()
const message = useMessage()
const imgEl = ref(null)
const confirming = ref(false)
const previewVisible = ref(false)
const liveCropDataUrl = ref('')
let cropper = null
let cropDebounceTimer = null

// 实时裁剪数据 → 预览（小尺寸 canvas，比确认上传的 2000px 更快）
const updateLivePreview = () => {
  if (!cropper) return
  try {
    const canvas = cropper.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 })
    if (canvas) {
      liveCropDataUrl.value = canvas.toDataURL('image/jpeg', 0.9)
    }
  } catch (e) {
    // cropper 尚未就绪时忽略
  }
}
const debouncedUpdateLivePreview = () => {
  clearTimeout(cropDebounceTimer)
  cropDebounceTimer = setTimeout(updateLivePreview, 120)
}

// 预览用的封面/头像：当前正在裁剪的那张用实时结果，另一张用表单已有值
const previewCover = computed(() =>
  props.type === 'cover' ? liveCropDataUrl.value : props.coverUrl
)
const previewAvatar = computed(() =>
  props.type === 'avatar' ? liveCropDataUrl.value : props.avatarUrl
)

const togglePreview = () => {
  previewVisible.value = !previewVisible.value
  if (previewVisible.value) {
    // 打开抽屉时立即刷新一次，避免显示旧值
    updateLivePreview()
  }
}

// 初始化（或重置）裁剪实例
const initCropper = () => {
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
  if (!imgEl.value || !props.imageSrc) return
  liveCropDataUrl.value = ''
  cropper = new Cropper(imgEl.value, {
    aspectRatio: props.aspectRatio,
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 0.9,
    background: false,
    responsive: true,
    restore: false,
    movable: true,
    zoomable: true,
    zoomOnTouch: true,
    zoomOnWheel: true,
    rotatable: false,
    scalable: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false,
    ready: updateLivePreview,
    crop: debouncedUpdateLivePreview,
    cropend: updateLivePreview
  })
}

const destroyCropper = () => {
  clearTimeout(cropDebounceTimer)
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
  liveCropDataUrl.value = ''
}

// 弹窗打开时初始化，关闭时销毁
watch(
  () => props.show,
  async (val) => {
    if (val) {
      await nextTick()
      initCropper()
    } else {
      previewVisible.value = false
      destroyCropper()
    }
  }
)

// 同一弹窗连续裁剪不同图片（如头像→封面）时，imageSrc 变化重新初始化
watch(
  () => props.imageSrc,
  async () => {
    if (props.show) {
      await nextTick()
      initCropper()
    }
  }
)

const handleReset = () => {
  cropper?.reset()
}

const handleCancel = () => {
  emit('cancel')
  emit('update:show', false)
}

const handleConfirm = () => {
  if (!cropper) return
  const canvas = cropper.getCroppedCanvas({
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    maxWidth: 2000,
    maxHeight: 2000
  })
  if (!canvas) {
    message.error(t('circle.form.messages.cropFailed'))
    return
  }
  confirming.value = true
  canvas.toBlob(
    (blob) => {
      confirming.value = false
      if (!blob) {
        message.error(t('circle.form.messages.cropFailed'))
        return
      }
      emit('confirm', blob)
      emit('update:show', false)
    },
    'image/jpeg',
    0.92
  )
}

onBeforeUnmount(() => {
  destroyCropper()
})
</script>

<style scoped>
.cropper-wrapper {
  width: 100%;
  height: 420px;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 14px;
  overflow: hidden;
}

.cropper-img {
  display: block;
  max-width: 100%;
  /* 初始隐藏原图，避免 cropperjs 初始化前闪现 */
  visibility: hidden;
}

/* 与 CreateCircleModal 风格统一：卡片玻璃质感 + 绿色标题 */
:deep(.n-card) {
  background: var(--glass-bg) !important;
  border: 1px solid var(--glass-border) !important;
  box-shadow: var(--shadow-lg) !important;
}

:deep(.n-card-header__title) {
  font-size: 22px !important;
  font-weight: 700 !important;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.preview-hint {
  margin: 0 0 16px 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.5;
}
</style>
