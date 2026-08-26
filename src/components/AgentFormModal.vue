<template>
  <NModal
    v-model:show="visible"
    :mask-closable="false"
    preset="card"
    :style="{ width: '640px', borderRadius: '24px' }"
    :title="isEdit ? t('agent.edit') : t('agent.create')"
    :segmented="{ content: 'soft' }"
    :bordered="false"
    size="huge"
  >
    <NForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="top"
      class="agent-form"
    >
      <!-- 分区一：基本信息 -->
      <div class="form-section">
        <div class="section-header">
          <span class="section-dot" />
          <span class="section-title">{{ t('agent.form.sectionBasic') }}</span>
        </div>
        <NFormItem :label="t('agent.form.name')" path="name">
          <NInput
            v-model:value="formData.name"
            :placeholder="t('agent.form.namePlaceholder')"
            maxlength="50"
            show-count
          />
        </NFormItem>

        <NFormItem :label="t('agent.form.avatarUrl')">
          <div class="avatar-row">
            <NAvatar
              round
              :size="56"
              :src="formData.avatar_url || undefined"
              class="avatar-preview"
            >
              <span v-if="!formData.avatar_url" class="avatar-fallback">🤖</span>
            </NAvatar>
            <NUpload
              :show-file-list="false"
              :custom-request="handleAvatarUpload"
              @before-upload="beforeAvatarUpload"
              accept="image/*"
            >
              <NButton secondary size="small" round>
                {{ t('agent.form.avatarUpload') }}
              </NButton>
            </NUpload>
            <NButton
              v-if="formData.avatar_url"
              quaternary
              size="small"
              round
              @click="formData.avatar_url = ''"
            >
              {{ t('agent.form.avatarRemove') }}
            </NButton>
          </div>
        </NFormItem>
      </div>

      <!-- 分区二：模型接入 -->
      <div class="form-section">
        <div class="section-header">
          <span class="section-dot" />
          <span class="section-title">{{ t('agent.form.sectionApi') }}</span>
        </div>
        <div class="api-grid">
          <NFormItem :label="t('agent.form.protocol')" path="api_protocol">
            <NSelect
              v-model:value="formData.api_protocol"
              :options="protocolOptions"
              :placeholder="t('agent.form.protocol')"
            />
          </NFormItem>

          <NFormItem :label="t('agent.form.baseUrl')" path="base_url">
            <NInput
              v-model:value="formData.base_url"
              :placeholder="t('agent.form.baseUrlPlaceholder')"
            />
          </NFormItem>
        </div>

        <!-- api_key：创建=明文输入；编辑=掩码展示 + 独立换 key 输入框（不回填旧值） -->
        <NFormItem v-if="!isEdit" :label="t('agent.form.apiKey')" path="api_key">
          <NInput
            v-model:value="formData.api_key"
            type="password"
            show-password-on="click"
            :placeholder="t('agent.form.apiKeyPlaceholder')"
          />
        </NFormItem>
        <NFormItem v-else :label="t('agent.form.apiKey')">
          <div class="key-block">
            <NText depth="3" class="key-masked">
              {{ agent.has_api_key
                ? t('agent.form.apiKeyCurrent', { mask: agent.api_key_masked })
                : t('agent.form.apiKeyNone') }}
            </NText>
            <NInput
              v-model:value="formData.new_api_key"
              type="password"
              show-password-on="click"
              :placeholder="t('agent.form.apiKeyNewPlaceholder')"
              :disabled="formData.clear_api_key"
              class="key-new-input"
            />
            <NCheckbox
              v-model:checked="formData.clear_api_key"
              size="small"
              class="key-clear-check"
            >
              {{ t('agent.form.apiKeyClear') }}
            </NCheckbox>
          </div>
        </NFormItem>

        <NFormItem :label="t('agent.form.model')" path="model">
          <NInput
            v-model:value="formData.model"
            :placeholder="t('agent.form.modelPlaceholder')"
            maxlength="100"
          />
        </NFormItem>

        <!-- llm_params：白名单 5 键，只提交填写的；整体替换语义 -->
        <NFormItem :label="t('agent.form.llmParams')">
          <div class="llm-params">
            <NInputNumber
              v-for="key in LLM_PARAM_KEYS"
              :key="key"
              v-model:value="formData.llm[key]"
              :placeholder="key"
              :min="0"
            >
              <template #prefix><span class="llm-key">{{ key }}:</span></template>
            </NInputNumber>
          </div>
        </NFormItem>

        <NFormItem :label="t('agent.form.systemPrompt')" path="system_prompt">
          <NInput
            v-model:value="formData.system_prompt"
            type="textarea"
            :placeholder="t('agent.form.systemPromptPlaceholder')"
            :autosize="{ minRows: 3, maxRows: 6 }"
            maxlength="2000"
          />
        </NFormItem>
      </div>

      <!-- 分区三：触发与限频 -->
      <div class="form-section">
        <div class="section-header">
          <span class="section-dot" />
          <span class="section-title">{{ t('agent.form.sectionTrigger') }}</span>
        </div>
        <!-- 仅支持关键词触发（trigger_mode 固定 2），关键词必填 -->
        <NFormItem
          :label="t('agent.form.keywords')"
          path="trigger_keywords"
        >
          <NDynamicTags
            v-model:value="formData.trigger_keywords"
            :placeholder="t('agent.form.keywordsPlaceholder')"
          />
        </NFormItem>

        <div class="rate-row">
          <NFormItem :label="t('agent.form.maxReplies')" path="max_replies_per_hour">
            <NInputNumber
              v-model:value="formData.max_replies_per_hour"
              :min="0"
              :placeholder="t('agent.form.maxReplies')"
              style="width: 100%"
            >
              <template #suffix>{{ t('agent.form.perHour') }}</template>
            </NInputNumber>
          </NFormItem>
          <NFormItem :label="t('agent.form.minInterval')" path="min_interval_sec">
            <NInputNumber
              v-model:value="formData.min_interval_sec"
              :min="0"
              :placeholder="t('agent.form.minInterval')"
              style="width: 100%"
            >
              <template #suffix>{{ t('agent.form.seconds') }}</template>
            </NInputNumber>
          </NFormItem>
        </div>

        <NAlert :title="t('agent.form.noteTitle')" type="info" :bordered="false">
          {{ t('agent.form.note') }}
        </NAlert>
      </div>
    </NForm>

    <!-- 头像裁剪弹窗（1:1，仅预览圆形头像；确认后直接上传回填 URL） -->
    <ImageCropperModal
      v-model:show="cropperVisible"
      :image-src="cropperImageSrc"
      :aspect-ratio="1"
      :title="t('agent.form.cropAvatarTitle')"
      type="avatar"
      avatar-only
      :avatar-url="formData.avatar_url"
      :upload-handler="handleCropUpload"
      @confirm="handleCropConfirm"
      @cancel="releaseCropperSrc"
    />

    <template #footer>
      <div class="modal-footer">
        <NButton quaternary @click="visible = false">{{ t('common.cancel') }}</NButton>
        <NButton
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ isEdit ? t('common.save') : t('agent.create') }}
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  NModal, NForm, NFormItem, NInput, NInputNumber, NSelect,
  NDynamicTags, NCheckbox, NButton, NAlert, NText,
  NAvatar, NUpload, useMessage
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { createAgent, updateAgent } from '@/api/agent'
import ImageCropperModal from '@/components/ImageCropperModal.vue'
import { useImageUpload } from '@/composables/useImageUpload'

// llm_params 后端白名单键（值为数字，其余键一律 400）
const LLM_PARAM_KEYS = [
  'temperature', 'top_p', 'max_tokens', 'presence_penalty', 'frequency_penalty'
]

const props = defineProps({
  show: { type: Boolean, default: false },
  // null=创建模式；AgentVO=编辑模式
  agent: { type: Object, default: null }
})
const emit = defineEmits(['update:show', 'success'])

const { t } = useI18n()
const message = useMessage()

const visible = computed({
  get: () => props.show,
  set: v => emit('update:show', v)
})
const isEdit = computed(() => !!props.agent)

// 后端当前只支持 openai / anthropic 两种模型协议
const protocolOptions = [
  { label: 'openai', value: 'openai' },
  { label: 'anthropic', value: 'anthropic' }
]

const formRef = ref(null)
const submitting = ref(false)

const emptyForm = () => ({
  name: '',
  avatar_url: '',
  api_protocol: 'openai',
  base_url: '',
  // 创建模式：明文 key，可空
  api_key: '',
  // 编辑模式：换 key 用独立输入框，不回填旧值（后端只回掩码，明文拿不到）
  new_api_key: '',
  clear_api_key: false,
  model: '',
  // 创建模式：常见 LLM 默认参数（编辑模式会逐一被 agent.llm_params 覆盖）
  llm: {
    temperature: 0.7,
    top_p: 1,
    max_tokens: 1024,
    presence_penalty: 0,
    frequency_penalty: 0
  },
  system_prompt: '',
  // 仅支持关键词触发：固定 2（「所有新帖」1 与「手动」3 已下线）
  trigger_mode: 2,
  trigger_keywords: [],
  max_replies_per_hour: 30,
  min_interval_sec: 60
})

const formData = ref(emptyForm())

// ===== 头像：NUpload 选图 -> ImageCropperModal 裁剪 -> 上传回填 URL =====
const { uploadOne } = useImageUpload()
const cropperVisible = ref(false)
const cropperImageSrc = ref('')

// 上传前校验：类型 + 大小（与 UserProfile 头像限制一致）
const beforeAvatarUpload = ({ file }) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    message.error(t('agent.form.avatarTypeError'))
    return false
  }
  if (file.size > 10 * 1024 * 1024) {
    message.error(t('agent.form.avatarSizeError'))
    return false
  }
  return true
}

// 选图后不直接上传，先打开裁剪弹窗（1:1）
const handleAvatarUpload = ({ file }) => {
  releaseCropperSrc()
  cropperImageSrc.value = URL.createObjectURL(file.file)
  cropperVisible.value = true
}

const releaseCropperSrc = () => {
  if (cropperImageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(cropperImageSrc.value)
    cropperImageSrc.value = ''
  }
}

// 裁剪确认 -> 在裁剪弹窗内上传（由 ImageCropperModal 调用，进度条由弹窗展示）
const handleCropUpload = async (blob, { onProgress } = {}) => {
  const avatarFile = new File([blob], 'agent-avatar.jpg', { type: 'image/jpeg' })
  try {
    return await uploadOne(avatarFile, { onProgress })
  } catch (e) {
    console.error('机器人头像上传失败:', e)
    message.error(t('agent.form.avatarUploadFailed'))
    throw e // rethrow -> 裁剪弹窗保持打开，供重试
  }
}

// 上传成功 -> 回填头像 URL（avatar_url 为空串时后端存 NULL，diff 逻辑不受影响）
const handleCropConfirm = (payload) => {
  if (payload?.url) formData.value.avatar_url = payload.url
  releaseCropperSrc()
}

// 弹窗打开时以当前 agent 初始化表单（编辑）或重置为默认值（创建）
watch(
  () => props.show,
  show => {
    if (!show) return
    const fresh = emptyForm()
    if (props.agent) {
      const a = props.agent
      fresh.name = a.name || ''
      fresh.avatar_url = a.avatar_url || ''
      // 遗留协议（gemini/ollama 等）映射为 openai：下拉已无这些选项，
      // 保存时 diff 会把 api_protocol='openai' 一并提交，完成迁移
      fresh.api_protocol = ['openai', 'anthropic'].includes(a.api_protocol) ? a.api_protocol : 'openai'
      fresh.base_url = a.base_url || ''
      fresh.model = a.model || ''
      for (const k of LLM_PARAM_KEYS) {
        fresh.llm[k] = a.llm_params?.[k] ?? null
      }
      fresh.system_prompt = a.system_prompt || ''
      // 遗留 mode=1（所有新帖）/3（手动）的机器人统一迁移为关键词触发(2)：
      // 保存时 diff 会把 trigger_mode=2 一并提交，完成迁移
      fresh.trigger_mode = 2
      fresh.trigger_keywords = [...(a.trigger_keywords || [])]
      fresh.max_replies_per_hour = a.max_replies_per_hour ?? 30
      fresh.min_interval_sec = a.min_interval_sec ?? 60
    }
    formData.value = fresh
  }
)

const rules = computed(() => ({
  name: [
    { required: true, trigger: ['blur', 'input'], message: t('agent.form.namePlaceholder') }
  ],
  api_protocol: [
    { required: true, trigger: ['blur', 'change'], message: t('agent.form.protocol') }
  ],
  model: [
    { required: true, trigger: ['blur', 'input'], message: t('agent.form.modelPlaceholder') }
  ]
}))

// 只把填写了的白名单键组装进 llm_params（值须为数字）
const buildLlmParams = () => {
  const params = {}
  for (const k of LLM_PARAM_KEYS) {
    const v = formData.value.llm[k]
    if (v !== null && v !== undefined && v !== '') params[k] = v
  }
  return params
}

const sortedJson = obj => JSON.stringify(obj, Object.keys(obj).sort())

// 创建：全量字段（后端对未传字段有默认值）；api_key 为空不传
const buildCreatePayload = () => {
  const f = formData.value
  const payload = {
    name: f.name.trim(),
    avatar_url: f.avatar_url.trim(),
    api_protocol: f.api_protocol,
    base_url: f.base_url.trim(),
    model: f.model.trim(),
    system_prompt: f.system_prompt,
    trigger_mode: 2,
    trigger_keywords: [...f.trigger_keywords],
    max_replies_per_hour: f.max_replies_per_hour ?? 0,
    min_interval_sec: f.min_interval_sec ?? 0
  }
  if (f.api_key.trim()) payload.api_key = f.api_key.trim()
  const llm = buildLlmParams()
  if (Object.keys(llm).length) payload.llm_params = llm
  return payload
}

// 编辑：部分更新，diff 出变更字段（llm_params/trigger_keywords 整体替换语义）
const buildUpdatePayload = () => {
  const f = formData.value
  const a = props.agent
  const payload = {}

  if (f.name.trim() !== a.name) payload.name = f.name.trim()
  if ((f.avatar_url || '').trim() !== (a.avatar_url || '')) payload.avatar_url = f.avatar_url.trim()
  if ((f.base_url || '').trim() !== (a.base_url || '')) payload.base_url = f.base_url.trim()
  if (f.api_protocol !== a.api_protocol) payload.api_protocol = f.api_protocol
  if (f.model.trim() !== a.model) payload.model = f.model.trim()
  if (f.system_prompt !== (a.system_prompt || '')) payload.system_prompt = f.system_prompt

  // api_key：空串=清除，不传=保持不变
  if (f.clear_api_key) payload.api_key = ''
  else if (f.new_api_key.trim()) payload.api_key = f.new_api_key.trim()

  const llm = buildLlmParams()
  if (sortedJson(llm) !== sortedJson(a.llm_params || {})) payload.llm_params = llm

  const modeChanged = f.trigger_mode !== a.trigger_mode
  const keywordsChanged =
    JSON.stringify([...f.trigger_keywords].sort()) !== JSON.stringify([...(a.trigger_keywords || [])].sort())
  if (modeChanged || keywordsChanged) {
    // mode=2 必须与关键词同请求提交，故二者联动时一起发
    payload.trigger_mode = 2
    payload.trigger_keywords = [...f.trigger_keywords]
  }

  if ((f.max_replies_per_hour ?? 0) !== (a.max_replies_per_hour ?? 0)) {
    payload.max_replies_per_hour = f.max_replies_per_hour ?? 0
  }
  if ((f.min_interval_sec ?? 0) !== (a.min_interval_sec ?? 0)) {
    payload.min_interval_sec = f.min_interval_sec ?? 0
  }

  return payload
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const f = formData.value
  // 后端 400：mode 2 requires keywords -- 前端先拦
  if (!f.trigger_keywords.length) {
    message.warning(t('agent.form.keywordsRequired'))
    return
  }

  try {
    submitting.value = true
    if (isEdit.value) {
      const payload = buildUpdatePayload()
      if (!Object.keys(payload).length) {
        message.warning(t('agent.form.atLeastOne'))
        return
      }
      const res = await updateAgent(props.agent.id, payload)
      message.success(t('agent.form.updateSuccess'))
      emit('success', res.data)
    } else {
      const res = await createAgent(buildCreatePayload())
      message.success(t('agent.form.createSuccess'))
      emit('success', res.data)
    }
    visible.value = false
  } catch (e) {
    // 409 撞名 / 400 校验等：直接透出后端 message
    message.error(e.message || t('common.operationFailed'))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* ===== 弹窗标题：主题绿渐变文字（沿用 CreateCircleModal 范式；
 * NModal 虽 teleport 到 body，但 scoped data-v 属性随 DOM 一起传送，
 * :deep 仍可命中弹窗内部元素；NSelect 菜单除外（独立容器，走全局样式） ===== */
:deep(.n-card-header__title) {
  font-size: 20px !important;
  font-weight: 700 !important;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ===== 表单滚动区 ===== */
.agent-form {
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 8px;
}

/* ===== 分区面板：玻璃内衬，圆角较弹窗外壳小一档（24 -> 16） ===== */
.form-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px 16px 4px;
  margin-bottom: 14px;
  transition: border-color 0.2s ease;
}

.form-section:hover {
  border-color: rgba(255, 255, 255, 0.14);
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

/* 分区圆点：主题绿 + 柔光 */
.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-gradient);
  box-shadow: 0 0 8px rgba(102, 234, 194, 0.6);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}

/* ===== 输入 / 选择 / 数字输入：圆润 + 聚焦绿光晕（圆角 12 < 分区 16） ===== */
:deep(.n-input),
:deep(.n-base-selection),
:deep(.n-input-number) {
  --n-border-radius: 12px !important;
}

:deep(.n-input:not(.n-input--textarea)) {
  --n-height: 42px !important;
}

:deep(.n-input__textarea-el) {
  font-size: 14px;
  line-height: 1.7;
}

:deep(.n-input--focus),
:deep(.n-base-selection:focus-within),
:deep(.n-input-number:focus-within) {
  --n-border-focus: 1px solid rgba(102, 234, 194, 0.65) !important;
  --n-box-shadow-focus: 0 0 0 3px rgba(102, 234, 194, 0.15) !important;
}

/* ===== 关键词标签：胶囊 ===== */
:deep(.n-dynamic-tags .n-tag) {
  border-radius: 999px !important;
}

/* ===== 表单项间距收紧（分区已提供外距） ===== */
:deep(.n-form-item) {
  margin-bottom: 14px;
}

/* ===== 提示条：绿色玻璃风 ===== */
:deep(.n-alert) {
  border-radius: 12px !important;
  background: rgba(102, 234, 194, 0.06) !important;
  border: 1px solid rgba(102, 234, 194, 0.18) !important;
}

:deep(.n-alert .n-alert-body__title) {
  color: #8af0d0 !important;
}

/* ===== 局部布局 ===== */
/* 头像行：圆形预览 + 上传/移除按钮 */
.avatar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-preview {
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.avatar-fallback {
  font-size: 26px;
}

.api-grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px;
}

.key-block {
  width: 100%;
}

.key-masked {
  font-size: 13px;
}

.key-new-input {
  margin-top: 8px;
}

.key-clear-check {
  margin-top: 8px;
}

.llm-params {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
}

/* 参数名前缀：弱化色 + 冒号，与数值视觉分离（插槽内容在本组件作用域，scoped 可命中） */
.llm-key {
  color: var(--text-tertiary);
  font-size: 13px;
}

/* 数值：等宽系统字体栈 + 表格数字，数字对齐易读；macOS/Windows/Linux 均有回落 */
:deep(.n-input-number .n-input__input-el) {
  font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas,
    'Liberation Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.rate-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
