<template>
  <NModal
    v-model:show="showModal"
    :mask-closable="false"
    preset="card"
    :style="{ width: '600px', borderRadius: '24px' }"
    :title="t('circle.form.createButton')"
    header-style = "font-size: 28px;"
    :segmented="{ content: 'soft' }"
    :bordered="false"
    size="huge"
  >
    <NScrollbar>
      <NForm
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="top"
        require-mark-placement="right"
        class="scroll-bar"
        size="large"
      >
        <!-- 基本信息 -->
        <NFormItem :label="t('circle.form.name')" path="name">
          <NInput
            v-model:value="formData.name"
            :placeholder="t('circle.form.namePlaceholder')"
            maxlength="50"
            show-count
            @input="handleNameInput"
          />
        </NFormItem>

        <NFormItem :label="t('circle.form.slug')" path="slug">
          <NInput
            v-model:value="formData.slug"
            :placeholder="t('circle.form.slugPlaceholder')"
            maxlength="60"
          />
        </NFormItem>

        <NFormItem :label="t('circle.form.description')" path="description">
          <NInput
            v-model:value="formData.description"
            type="textarea"
            :placeholder="t('circle.form.descriptionPlaceholder')"
            :autosize="{ minRows: 5, maxRows: 7 }"
            maxlength="2000"
            show-count
          />
        </NFormItem>

        <NDivider />

        <!-- 图片上传 -->
        <NFormItem :label="t('circle.form.avatar')" path="avatar_url">
          <NUpload
            :max="1"
            :file-list="avatarFileList"
            @update:file-list="handleAvatarChange"
            :custom-request="handleUploadAvatar"
            list-type="image-card"
            accept="image/*"
          >
            {{ t('circle.form.avatarUpload') }}
          </NUpload>
          <template #feedback>
            <NText depth="3" style="font-size: 12px">{{ t('circle.form.avatarTip') }}</NText>
          </template>
        </NFormItem>

        <NFormItem :label="t('circle.form.cover')" path="cover_url">
          <NUpload
            :max="1"
            :file-list="coverFileList"
            @update:file-list="handleCoverChange"
            :custom-request="handleUploadCover"
            list-type="image-card"
            accept="image/*"
          >
            {{ t('circle.form.avatarUpload') }}
          </NUpload>
          <template #feedback>
            <NText depth="3" style="font-size: 12px">{{ t('circle.form.coverTip') }}</NText>
          </template>
        </NFormItem>

        <NDivider />

        <!-- 圈内规则 -->
        <NFormItem :label="t('circle.form.rules')" path="rule">
          <NInput
            v-model:value="formData.rule"
            type="textarea"
            :placeholder="t('circle.form.rulesPlaceholder')"
            :autosize="{ minRows: 6, maxRows: 10 }"
            maxlength="2000"
            show-count
          />
        </NFormItem>

        <NDivider />

        <!-- 分类与权限 -->
        <NFormItem :label="t('circle.form.category')" path="category_id">
          <NSelect
            v-model:value="formData.category_id"
            :options="categoryOptions"
            :loading="loadingCategories"
            :placeholder="t('circle.form.categoryPlaceholder')"
            filterable
          />
        </NFormItem>

        <NFormItem :label="t('circle.form.joinType')" path="join_type">
          <NRadioGroup v-model:value="formData.join_type" name="join_type">
            <NSpace vertical :size="12">
              <NRadio :value="0">
                <NText strong>{{ t('circle.form.joinTypeDirect') }}</NText>
                <NText depth="3" style="margin-left: 8px">{{ t('circle.form.joinTypeDirectDesc') }}</NText>
              </NRadio>
              <NRadio :value="1">
                <NText strong>{{ t('circle.form.joinTypeReview') }}</NText>
                <NText depth="3" style="margin-left: 8px">{{ t('circle.form.joinTypeReviewDesc') }}</NText>
              </NRadio>
              <NRadio :value="2">
                <NText strong>{{ t('circle.form.joinTypePrivate') }}</NText>
                <NText depth="3" style="margin-left: 8px">{{ t('circle.form.joinTypePrivateDesc') }}</NText>
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
      </NForm>
    </NScrollbar>

    <template #footer>
      <NSpace justify="end" :size="16">
        <NButton size="large" @click="handleCancel">{{ t('common.cancel') }}</NButton>
        <NButton type="primary" size="large" :loading="loading" @click="handleSubmit">
          {{ t('circle.form.createButton') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSpace,
  NUpload,
  NRadioGroup,
  NRadio,
  NSelect,
  NScrollbar,
  NDivider,
  NText,
  useMessage
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { getCategories, createCircle } from '@/api/circle'
import { uploadImage } from '@/api/user'

const { t } = useI18n()

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'success'])

const message = useMessage()
const formRef = ref(null)
const loading = ref(false)
const showModal = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

// 文件列表
const avatarFileList = ref([])
const coverFileList = ref([])

// 表单数据
const formData = ref({
  name: '',
  slug: '',
  avatar_url: '',
  cover_url: '',
  description: '',
  rule: '',
  category_id: null,
  join_type: 0
})

// 分类选项
const categoryOptions = ref([])
const loadingCategories = ref(false)

// 加载分类列表
const loadCategories = async () => {
  try {
    loadingCategories.value = true
    const res = await getCategories()
    if (res.code === 200 && res.data) {
      // 将分类数据转换为选项格式
      categoryOptions.value = res.data.map(cat => ({
        label: cat.name,
        value: cat.id
      }))
      console.log('分类列表加载成功:', categoryOptions.value)
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    message.error(t('circle.form.messages.loadCategoriesFailed'))
  } finally {
    loadingCategories.value = false
  }
}

// 表单验证规则
const rules = computed(() => ({
  name: [
    { required: true, message: t('circle.form.validation.nameRequired'), trigger: 'blur' },
    { min: 2, max: 50, message: t('circle.form.validation.nameLength'), trigger: 'blur' }
  ],
  slug: [
    {
      pattern: /^[a-z0-9-]*$/,
      message: t('circle.form.validation.slugPattern'),
      trigger: 'blur'
    },
    { max: 60, message: t('circle.form.validation.slugMaxLength'), trigger: 'blur' }
  ],
  description: [
    { required: true, message: t('circle.form.validation.descriptionRequired'), trigger: 'blur' },
    { min: 10, max: 2000, message: t('circle.form.validation.descriptionLength'), trigger: 'blur' }
  ],
  rule: [
    { required: true, message: t('circle.form.validation.rulesRequired'), trigger: 'blur' },
    { min: 10, max: 2000, message: t('circle.form.validation.rulesLength'), trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: t('circle.form.validation.categoryRequired'), trigger: 'change' }
  ]
}))

// 名称输入处理，自动生成 slug
const handleNameInput = () => {
  if (formData.value.name && !formData.value.slug) {
    formData.value.slug = formData.value.name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

// 处理头像上传
const handleAvatarChange = (options) => {
  avatarFileList.value = options
}

const handleUploadAvatar = async ({ file, onFinish, onError }) => {
  try {
    const res = await uploadImage(file.file)
    if (res.code === 200 && res.data) {
      formData.value.avatar_url = res.data.url
      message.success(t('circle.form.messages.avatarUploadSuccess'))
      onFinish()
    } else {
      message.error(res.message || t('circle.form.messages.avatarUploadFailed'))
      onError()
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    message.error(t('circle.form.messages.uploadFailedRetry'))
    onError()
  }
}

// 处理封面上传
const handleCoverChange = (options) => {
  coverFileList.value = options
}

const handleUploadCover = async ({ file, onFinish, onError }) => {
  try {
    const res = await uploadImage(file.file)
    if (res.code === 200 && res.data) {
      formData.value.cover_url = res.data.url
      message.success(t('circle.form.messages.coverUploadSuccess'))
      onFinish()
    } else {
      message.error(res.message || t('circle.form.messages.coverUploadFailed'))
      onError()
    }
  } catch (error) {
    console.error('封面上传失败:', error)
    message.error(t('circle.form.messages.uploadFailedRetry'))
    onError()
  }
}

// 提交表单
const handleSubmit = async () => {
  // 校验失败：naive-ui 已自动在字段下显示错误，静默返回，不误报网络错误
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  try {
    loading.value = true

    // 调用创建兴趣圈接口
    const res = await createCircle(formData.value)
    console.log('创建结果:' + res)
    if (res.code === 200) {
      message.success(t('circle.form.messages.createSuccess'))
      emit('success', res.data)
      handleReset()
      showModal.value = false
    } else {
      message.error(res.message || t('circle.form.messages.createFailed'))
    }
  } catch (error) {
    console.error('创建兴趣圈失败:', error)
    // 仅在此处才可能是接口/网络错误，优先显示接口返回的错误消息
    const errorMsg = error.message || t('circle.form.messages.createNetworkError')
    message.error(errorMsg)
  } finally {
    loading.value = false
  }
}

// 取消
const handleCancel = () => {
  showModal.value = false
  handleReset()
}

// 重置表单
const handleReset = () => {
  setTimeout(() => {
    formRef.value?.restoreValidation()
    formData.value = {
      name: '',
      slug: '',
      avatar_url: '',
      cover_url: '',
      description: '',
      rule: '',
      category_id: null,
      join_type: 0
    }
    avatarFileList.value = []
    coverFileList.value = []
  }, 200)
}

watch(showModal, (val) => {
  if (val) {
    // 弹窗打开时加载分类列表
    loadCategories()
  } else {
    handleReset()
  }
})
</script>

<style scoped>
/* 滚动区域：与新宽度协调，留出呼吸感 */
.scroll-bar {
  height: 65vh;
  padding: 24px;
}

/* ===== 卡片整体：圆润 + 柔和阴影 ===== */
:deep(.n-card) {
  border-radius: 24px !important;
  box-shadow: var(--shadow-lg) !important;
  background: var(--glass-bg) !important;
  border: 1px solid var(--glass-border) !important;
}

:deep(.n-card-header) {
  border-radius: 24px 24px 0 0 !important;
}

:deep(.n-card-header__title) {
  font-size: 26px !important;
  font-weight: 700 !important;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ===== 输入框 / 选择框：更高、更圆 ===== */
:deep(.n-input),
:deep(.n-base-selection) {
  --n-border-radius: 14px !important;
  --n-height: 52px !important;
  font-size: 15px;
}

:deep(.n-base-selection-label) {
  min-height: 52px !important;
}

:deep(.n-input__textarea-el) {
  font-size: 15px;
  line-height: 1.7;
}

/* 聚焦态：绿色边框 + 柔光晕 */
:deep(.n-input--focus),
:deep(.n-base-selection:focus-within) {
  --n-border-focus: 1px solid #18a058 !important;
  --n-box-shadow-focus: 0 0 0 3px rgba(24, 160, 88, 0.18) !important;
}

/* ===== 按钮：圆角 + 高度，主按钮绿色渐变 ===== */
:deep(.n-button) {
  --n-border-radius: 14px !important;
  --n-height: 46px !important;
  transition: all 0.2s ease;
}

:deep(.n-button--primary-type) {
  background: var(--primary-gradient) !important;
  border: none !important;
  color: #07140d !important;
  font-weight: 600 !important;
}

:deep(.n-button--primary-type:hover) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(34, 179, 106, 0.35);
  opacity: 0.95;
}

/* ===== 图片上传卡片：圆润化 ===== */
:deep(.n-upload-trigger--image-card),
:deep(.n-upload-file-list__item) {
  border-radius: 16px !important;
  transition: all 0.2s ease;
}

:deep(.n-upload-trigger--image-card:hover) {
  border-color: #18a058 !important;
  color: #18a058 !important;
}

/* ===== 表单标签：略增间距，更通透 ===== */
:deep(.n-form-item) {
  margin-bottom: 4px;
}
</style>
