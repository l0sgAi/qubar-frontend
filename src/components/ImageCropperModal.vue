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
        <NButton quaternary round @click="handleReset">
          {{ t('circle.form.cropReset') }}
        </NButton>
        <NSpace :size="12">
          <NButton round @click="handleCancel">{{ t('common.cancel') }}</NButton>
          <NButton type="primary" round :loading="confirming" @click="handleConfirm">
            {{ t('circle.form.cropConfirm') }}
          </NButton>
        </NSpace>
      </NSpace>
    </template>
  </NModal>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { NModal, NButton, NSpace, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import Cropper from 'cropperjs'

const props = defineProps({
  show: { type: Boolean, default: false },
  imageSrc: { type: String, default: '' },
  aspectRatio: { type: Number, default: 1 },
  title: { type: String, default: '' }
})
const emit = defineEmits(['update:show', 'confirm', 'cancel'])

const { t } = useI18n()
const message = useMessage()
const imgEl = ref(null)
const confirming = ref(false)
let cropper = null

// 初始化（或重置）裁剪实例
const initCropper = () => {
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
  if (!imgEl.value || !props.imageSrc) return
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
    toggleDragModeOnDblclick: false
  })
}

const destroyCropper = () => {
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
}

// 弹窗打开时初始化，关闭时销毁
watch(
  () => props.show,
  async (val) => {
    if (val) {
      await nextTick()
      initCropper()
    } else {
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
</style>
