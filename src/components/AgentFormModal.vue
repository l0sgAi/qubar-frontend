<template>
  <NModal
    v-model:show="visible"
    :mask-closable="false"
    preset="card"
    :style="{ width: '640px', borderRadius: '24px' }"
    :title="isEdit ? t('agent.edit') : t('agent.create')"
    header-style="font-size: 24px;"
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
      <!-- 基本信息 -->
      <NFormItem :label="t('agent.form.name')" path="name">
        <NInput
          v-model:value="formData.name"
          :placeholder="t('agent.form.namePlaceholder')"
          maxlength="50"
          show-count
        />
      </NFormItem>

      <NFormItem :label="t('agent.form.avatarUrl')" path="avatar_url">
        <NInput
          v-model:value="formData.avatar_url"
          :placeholder="t('agent.form.avatarPlaceholder')"
        />
      </NFormItem>

      <!-- API 接入 -->
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
          <NText depth="3" style="font-size: 13px">
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
            style="margin-top: 8px"
          />
          <NCheckbox
            v-model:checked="formData.clear_api_key"
            size="small"
            style="margin-top: 8px"
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
            <template #prefix>{{ key }}</template>
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

      <!-- 触发与限频 -->
      <NFormItem :label="t('agent.form.triggerMode')" path="trigger_mode">
        <NRadioGroup v-model:value="formData.trigger_mode">
          <NRadioButton :value="1">{{ t('agent.triggerModes.all') }}</NRadioButton>
          <NRadioButton :value="2">{{ t('agent.triggerModes.keyword') }}</NRadioButton>
          <NRadioButton :value="3">{{ t('agent.triggerModes.manual') }}</NRadioButton>
        </NRadioGroup>
      </NFormItem>

      <NFormItem
        v-if="formData.trigger_mode === 2"
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
    </NForm>

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
  NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NRadioGroup,
  NRadioButton, NDynamicTags, NCheckbox, NButton, NAlert, NText,
  useMessage
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { createAgent, updateAgent } from '@/api/agent'

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

const protocolOptions = [
  { label: 'openai', value: 'openai' },
  { label: 'anthropic', value: 'anthropic' },
  { label: 'gemini', value: 'gemini' },
  { label: 'ollama', value: 'ollama' }
]

const formRef = ref(null)
const submitting = ref(false)

const emptyForm = () => ({
  name: '',
  avatar_url: '',
  api_protocol: 'openai',
  base_url: '',
  // 创建模式：明文 key，可空（ollama 免 key）
  api_key: '',
  // 编辑模式：换 key 用独立输入框，不回填旧值（后端只回掩码，明文拿不到）
  new_api_key: '',
  clear_api_key: false,
  model: '',
  llm: Object.fromEntries(LLM_PARAM_KEYS.map(k => [k, null])),
  system_prompt: '',
  trigger_mode: 1,
  trigger_keywords: [],
  max_replies_per_hour: 30,
  min_interval_sec: 60
})

const formData = ref(emptyForm())

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
      fresh.api_protocol = a.api_protocol || 'openai'
      fresh.base_url = a.base_url || ''
      fresh.model = a.model || ''
      for (const k of LLM_PARAM_KEYS) {
        fresh.llm[k] = a.llm_params?.[k] ?? null
      }
      fresh.system_prompt = a.system_prompt || ''
      fresh.trigger_mode = a.trigger_mode || 1
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
    trigger_mode: f.trigger_mode,
    trigger_keywords: f.trigger_mode === 2 ? [...f.trigger_keywords] : [],
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
    payload.trigger_mode = f.trigger_mode
    payload.trigger_keywords = f.trigger_mode === 2 ? [...f.trigger_keywords] : []
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
  if (f.trigger_mode === 2 && f.trigger_keywords.length === 0) {
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
.agent-form {
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 8px;
}

.key-block {
  width: 100%;
}

.llm-params {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
}

.rate-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
