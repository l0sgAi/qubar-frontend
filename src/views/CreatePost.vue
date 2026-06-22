<template>
  <div class="create-post-page">
    <!-- 顶栏 -->
    <AppHeader />

    <!-- 侧边栏 -->
    <SideNav @collapsed="offset = 64" @expanded="offset = 260" />

    <!-- 主内容区域 -->
    <div class="main-content" :style="{ 'margin-left': `${offset}px`, width: `calc(100% - ${offset}px)` }">
      <div class="create-post-container">
        <div class="content-wrapper">
          <NCard
          :title="t('post.createPost')"
          :bordered="false"
          class="post-card"
          :header-style="{fontSize:'35px',marginLeft:'20px',marginTop:'20px'}"
          >
            <NForm
              ref="formRef"
              :model="formData"
              :rules="rules"
              label-placement="top"
              require-mark-placement="right-hanging"
            >
              <!-- 圈子选择 -->
              <NFormItem :label="t('post.belongToCircle')" path="circle_id">
                <NSelect
                  v-model:value="formData.circle_id"
                  :options="circleOptions"
                  :loading="loadingCircles"
                  filterable
                  :placeholder="t('post.selectCircle')"
                  clearable
                  @search="handleSearchCircle"
                  @update:value="handleCircleChange"
                  :render-label="renderCircleLabel"
                  size="large"
                  class="circle-select"
                />
              </NFormItem>

              <!-- 标题 -->
              <NFormItem :label="t('post.title')" path="title">
                <NInput
                  v-model:value="formData.title"
                  :placeholder="t('post.titlePlaceholder')"
                  maxlength="200"
                  show-count
                  size="large"
                  class="title-input"
                />
              </NFormItem>

              <!-- 摘要 -->
              <!-- <NFormItem label="摘要（检索关键词，可选）" path="summary">
                <NInput
                  v-model:value="formData.summary"
                  type="textarea"
                  placeholder="请输入摘要，用于检索和关键词匹配"
                  maxlength="500"
                  show-count
                  size="large"
                  class="title-input"
                />
              </NFormItem> -->

              <!-- 正文（Markdown编辑器） -->
              <NFormItem :label="t('post.content')" path="content">
                <MdEditor
                  v-model="formData.content"
                  :language="language"
                  :preview="true"
                  :toolbars="toolbars"
                  theme="dark"
                  :placeholder="t('post.contentPlaceholder')"
                  :max-length="50000"
                  :rows="25"
                  @onUploadImg="handleUploadImg"
                />
              </NFormItem>
              <div class="footer-actions">
                <NButton size="large" @click="handleCancel">{{ t('common.cancel') }}</NButton>
                <NButton
                  size="large"
                  type="primary"
                  :loading="submitting"
                  @click="handleSubmit"
                >
                  {{ t('common.submit') }}
                </NButton>
              </div>
            </NForm>
            <!-- 图片上传浮标（居中、醒目） -->
            <Transition name="upload-overlay">
              <div v-if="uploading" class="upload-overlay">
                <div class="upload-floater">
                  <NProgress type="circle" :percentage="overallProgress" :radius="64" :stroke-width="7" />
                  <span class="upload-floater__label">{{ t('upload.uploading') }}</span>
                </div>
              </div>
            </Transition>
          </NCard>

          <!-- 右侧规则卡片 -->
          <CircleRuleCard :circle-data="selectedCircleData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NAvatar,
  NText,
  NProgress,
  useMessage
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import AppHeader from '@/components/AppHeader.vue'
import SideNav from '@/components/SideNav.vue'
import CircleRuleCard from '@/components/post-create/CircleRuleCard.vue'
import { getMyCircles, createPost } from '@/api/post'
import { getCircleDetail } from '@/api/circle'
import { useImageUpload } from '@/composables/useImageUpload'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const { t } = useI18n()
const { uploading, progress, uploadMany } = useImageUpload({ withProgress: true })
// md-editor 内部不便自定义 loading，故用浮标展示整批上传整体进度
const overallProgress = computed(() => {
  const arr = progress.value
  if (!arr.length) return 0
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
})
const offset = ref(260)
const formRef = ref(null)
const submitting = ref(false)
const loadingCircles = ref(false)
const language = ref('zh-CN')
let searchTimer = null

// 选中的圈子数据
const selectedCircleData = ref(null)

// 表单数据
const formData = ref({
  circle_id: null,
  title: '',
  summary: '',
  content: '',
  media_extra: []
})

// 圈子选项
const circleOptions = ref([])

// 编辑器工具栏配置
const toolbars = [
  'bold',
  'underline',
  'italic',
  '-',
  'title',
  'strikeThrough',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'katex',
  'mermaid',
  '-',
  'revoke',
  'next',
  'save',
  '=',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'previewOnly',
  'catalog'
]

// 表单验证规则
const rules = {
  circle_id: {
    required: true,
    message: '请选择所属圈子',
    trigger: ['change', 'blur']
  },
  title: {
    required: true,
    message: '请输入帖子标题',
    trigger: ['blur', 'input']
  },
  content: {
    required: true,
    message: '请输入帖子正文',
    trigger: ['blur', 'input']
  }
}

// 加载用户已加入的圈子列表
const loadCircles = async (keyword = '') => {
  try {
    loadingCircles.value = true
    const res = await getMyCircles({
      keyword,
      size: 50
    })

    if (res.data && res.data.circles) {
      circleOptions.value = res.data.circles.map(circle => ({
        label: circle.name,
        value: circle.id,
        avatar: circle.avatar_url,
        member_count: circle.member_count
      }))
    }
  } catch (error) {
    console.error('加载圈子列表失败:', error)
    message.error('加载圈子列表失败')
  } finally {
    loadingCircles.value = false
  }
}

// 搜索圈子（带防抖）
const handleSearchCircle = (keyword) => {
  // 清除之前的定时器
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  // 如果没有输入，加载所有圈子
  if (!keyword) {
    loadCircles('')
    return
  }

  // 设置新的定时器，2秒后执行搜索
  searchTimer = setTimeout(() => {
    loadCircles(keyword)
  }, 2000)
}

// 自定义圈子选项渲染
const renderCircleLabel = (option) => {
  return h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' } }, [
    h(NAvatar, {
      size: 48,
      src: option.avatar || undefined,
      round: true
    }, {
      default: () => !option.avatar ? (option.label?.charAt(0) || '?') : undefined
    }),
    h('div', { style: { flex: 1 } }, [
      h('div', { style: { fontWeight: 500, fontSize: '21px' } }, option.label),
      h(NText, {
        depth: 3,
        style: { fontSize: '16px' }
      }, { default: () => `${option.member_count || 0} ${t('circle.members')}` })
    ])
  ])
}

// 圈子选择变化时加载圈子详情
const handleCircleChange = async (circleId) => {
  if (!circleId) {
    selectedCircleData.value = null
    return
  }

  try {
    const res = await getCircleDetail(circleId)
    if (res.data) {
      selectedCircleData.value = res.data
    }
  } catch (error) {
    console.error('加载圈子详情失败:', error)
  }
}

// 上传图片（md-editor onUploadImg 回调）
const handleUploadImg = async (files, callback) => {
  try {
    const urls = await uploadMany(files)
    // 回填到 media_extra 字段（提交时会被 extractImageUrls 覆盖，此处仅保留即时状态）
    formData.value.media_extra = [...formData.value.media_extra, ...urls]
    callback(urls)
    message.success(t('upload.success'))
  } catch (error) {
    console.error('图片上传失败:', error)
    message.error(t('upload.failed'))
  }
}

// 从 Markdown 内容中提取所有图片 URL
const extractImageUrls = (content) => {
  const imageRegex = /!\[.*?\]\((.*?)\)/g
  const urls = []
  let match
  while ((match = imageRegex.exec(content)) !== null) {
    urls.push(match[1])
  }
  return urls
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    submitting.value = true

    // 从内容中提取实际的图片 URL，更新 media_extra
    const actualUrls = extractImageUrls(formData.value.content)
    const submitData = {
      ...formData.value,
      media_extra: actualUrls
    }

    const res = await createPost(submitData)

    message.success('发布成功')

    // 跳转到帖子详情页
    if (res.data) {
      const postId = res.data
      router.push({
        name: 'post-detail',
        params: { id: postId }
      })
    } else {
      message.warning('未获取到帖子ID，返回首页')
      router.push('/home')
    }
  } catch (error) {
    console.error('发布失败:', error)
    if (error.errors) {
      // 表单验证错误
      return
    }
    message.error(error.message || '发布失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 取消
const handleCancel = () => {
  router.back()
}

onMounted(async () => {
  await loadCircles()

  // 检查 URL 参数中是否有 circleId，如果有则默认选中
  const circleIdFromUrl = route.query.circleId
  if (circleIdFromUrl) {
    const circleId = circleIdFromUrl
    // 检查圈子是否在选项列表中
    const circleExists = circleOptions.value.some(option => option.value === circleId)
    if (circleExists) {
      formData.value.circle_id = circleId
      // 加载圈子详情以显示规则卡片
      await handleCircleChange(circleId)
    }
  }
})
</script>

<style scoped>
.upload-overlay {
  position: fixed;
  inset: 0;
  /* md-editor-v3 的 Modal/dropdown zIndex 基准 20000（config.mjs），
     原值 1000 会被其图片上传浮层盖住，导致编辑器内上传看不到进度。
     提到 99999 确保进度浮标始终可见；pointer-events:none 不影响下层操作。 */
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.22);
  pointer-events: none;
}

.upload-floater {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 28px 40px;
  background: rgba(24, 24, 28, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
  pointer-events: none;
}

.upload-floater__label {
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.upload-overlay-enter-active,
.upload-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.upload-overlay-enter-from,
.upload-overlay-leave-to {
  opacity: 0;
}

.create-post-page {
  min-height: 100vh;
  position: relative;
}

.main-content {
  margin-top: 64px;
  padding: 24px;
  min-height: calc(100vh - 64px);
  transition: margin-left 0.3s ease, width 0.3s ease;
}

.create-post-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.content-wrapper {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.content-wrapper .post-card {
  flex: 1;
  min-width: 0;
}

.post-card {
  border-radius: 16px !important;
  overflow: hidden;
}

:deep(.n-card__header) {
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.n-card__content) {
  padding: 32px;
}

:deep(.n-card__footer) {
  padding: 20px 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.n-form-item) {
  margin-bottom: 28px;
}

:deep(.n-form-item-label) {
  font-weight: 500;
  font-size: 16px;
  padding-bottom: 10px;
}

/* 圈子选择下拉框 */
.circle-select {
  max-width: 33.33%;
}

:deep(.circle-select .n-base-selection) {
  min-height: 62px !important;
}

:deep(.circle-select .n-base-selection__border),
:deep(.circle-select .n-base-selection__border--focused) {
  box-shadow: none !important;
}

:deep(.circle-select .n-base-selection-label) {
  min-height: 62px !important;
  font-size: 18px !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.circle-select .n-base-selection-placeholder) {
  font-size: 18px !important;
  min-height: 62px !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.circle-select .n-base-selection-input) {
  font-size: 18px !important;
}

/* 下拉列表选项样式 */
:deep(.n-virtuoso__item) {
  min-height: 56px !important;
}

:deep(.n-base-select-option__content) {
  min-height: 56px !important;
  padding: 12px 16px !important;
}

:deep(.n-input),
:deep(.n-base-selection) {
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

:deep(.n-input:hover),
:deep(.n-base-selection:hover) {
  border-radius: 12px !important;
}

:deep(.n-input__input-el),
:deep(.n-input__textarea-el) {
  font-size: 18px;
}

:deep(.n-input--large .n-input__input-el),
:deep(.n-input--large .n-input__textarea-el) {
  font-size: 18px;
}

/* 标题输入框样式 */
.title-input {
  min-height: 64px;
  font-size: 18px;
  max-width: 75%;
}

:deep(.title-input .n-input__input-el) {
  height: 64px !important;
  line-height: 64px !important;
  font-size: 18px !important;
}

/* 摘要输入框样式 */
.summary-input :deep(.n-input__textarea-el) {
  font-size: 18px !important;
  line-height: 1.6;
}

/* Markdown 编辑器样式 */
:deep(.md-editor) {
  font-size: 18px !important;
  border-radius: 18px !important;
  overflow: hidden;
}

/* 强制覆盖所有内部文本:字体 */
:deep(.md-editor *) {
  font-family: 'Fira Code', 'Cascadia Code', 'Maple Mono NF CN', 'JetBrains Mono', 'Source Code Pro', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'PingFang SC', 'Microsoft YaHei', monospace;
}

:deep(.cm-scroller *){
  font-size: 18px;
}

/* 工具栏样式 */
:deep(.md-editor-toolbar) {
  font-size: 18px !important;
  border-radius: 21px 21px 0 0 !important;
  padding: 7px !important;
}

:deep(.md-editor-toolbar-item svg) {
  width: 18px !important;
  height: 18px !important;
}

:deep(.md-editor-footer){
  height: 7% !important;
}

/* 底部按钮 */
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.footer-actions .n-button {
  min-width: 120px;
  border-radius: 10px;
  font-weight: 500;
}

/* md-editor-v3 深色主题自定义 — 偏黑底色 */
:deep(.md-editor-dark) {
  --md-bk-color: rgb(24, 24, 28);
  --md-scrollbar-bg-color: rgb(24, 24, 28);
}

:deep(.md-editor-dark .md-editor-preview) {
  --md-theme-bg-color: rgb(24, 24, 28);
  /* --md-theme-bg-color-inset: #141419;
  --md-theme-color-hover: #141419;
  --md-theme-border-color: rgba(255, 255, 255, 0.1);
  --md-theme-code-block-bg-color: #141419;
  --md-theme-table-stripe-color: #0a0a0f; */
}

/* 响应式 */
@media (max-width: 1400px) {
  .main-content {
    margin-right: 24px;
  }
}

@media (max-width: 1200px) {
  .main-content {
    margin-right: 24px;
  }

  .content-wrapper {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-right: 0;
    padding: 16px;
  }

  :deep(.n-card__header),
  :deep(.n-card__content),
  :deep(.n-card__footer) {
    padding: 20px;
  }

  .create-post-container {
    max-width: 100%;
  }
  
}
</style>
