import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { NButton, NSwitch, NCheckbox } from 'naive-ui'

const mocks = vi.hoisted(() => ({
  createAgent: vi.fn(),
  updateAgent: vi.fn(),
  createCircleAgent: vi.fn(),
  updateCircleAgent: vi.fn(),
  message: { success: vi.fn(), warning: vi.fn(), error: vi.fn() }
}))

vi.mock('@/api/agent', () => ({ createAgent: mocks.createAgent, updateAgent: mocks.updateAgent }))
vi.mock('@/api/circle', () => ({
  createCircleAgent: mocks.createCircleAgent,
  updateCircleAgent: mocks.updateCircleAgent
}))
vi.mock('@/composables/useImageUpload', () => ({ useImageUpload: () => ({ uploadOne: vi.fn() }) }))
vi.mock('naive-ui', async (importOriginal) => ({
  ...(await importOriginal()),
  useMessage: () => mocks.message
}))

const { default: AgentFormModal } = await import('@/components/agent/AgentFormModal.vue')
const { createTestI18n } = await import('../helpers/plugins')

const autoReply = (over = {}) => ({
  enabled: true,
  targets: ['post', 'comment'],
  post_hot_min: 200,
  comment_like_min: 20,
  comment_reply_min: 0,
  window_hours: 24,
  max_per_hour: 5,
  ...over
})

const agentVO = (over = {}) => ({
  id: 'a1',
  name: 'bot',
  avatar_url: '',
  api_protocol: 'openai',
  base_url: '',
  has_api_key: false,
  model: 'gpt-4o-mini',
  llm_params: {},
  system_prompt: '',
  filter_prompt: '',
  trigger_mode: 2,
  trigger_keywords: ['hi'],
  max_replies_per_hour: 30,
  min_interval_sec: 60,
  ...over
})

let wrapper

// 弹窗按 show 的变化初始化表单，故先以 show=false 挂载再打开
const openModal = async (props = {}) => {
  wrapper = mount(AgentFormModal, {
    props: { show: false, ...props },
    attachTo: document.body,
    global: {
      plugins: [createTestI18n()],
      stubs: { ImageCropperModal: true }
    }
  })
  await wrapper.setProps({ show: true })
  await flushPromises()
  return wrapper
}

const form = () => wrapper.vm.formData
const bodyText = () => document.body.textContent
const toggle = async on => {
  wrapper.findComponent(NSwitch).vm.$emit('update:value', on)
  await flushPromises()
}
const submit = async () => {
  const btn = wrapper.findAllComponents(NButton).find(b => b.props('type') === 'primary')
  btn.vm.$emit('click', new MouseEvent('click'))
  await flushPromises()
}

describe('AgentFormModal 自动回复', () => {
  beforeEach(() => {
    Object.values(mocks).forEach(m => typeof m === 'function' && m.mockReset())
    Object.values(mocks.message).forEach(fn => fn.mockReset())
    mocks.updateAgent.mockResolvedValue({ data: {} })
    mocks.updateCircleAgent.mockResolvedValue({ data: {} })
    mocks.createCircleAgent.mockResolvedValue({ data: {} })
  })

  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('编辑：回显已有配置并展开字段，展示说明', async () => {
    await openModal({ agent: agentVO({ auto_config: { auto_reply: autoReply() } }) })
    expect(form().auto_reply).toEqual(autoReply())
    expect(wrapper.findComponent(NSwitch).props('value')).toBe(true)
    expect(wrapper.findAllComponents(NCheckbox).map(c => c.text())).toContain('评论（回复到该评论楼层）')
    expect(bodyText()).toContain('帖子热度门槛')
    expect(bodyText()).toContain('每个机器人对同一目标最多自动回复一次')
    expect(bodyText()).toContain('全局机器人扫描全站内容')
  })

  it('编辑：只改自动回复时提交完整 auto_reply 对象', async () => {
    await openModal({ agent: agentVO({ auto_config: { auto_reply: autoReply() } }) })
    form().auto_reply.max_per_hour = 8
    await submit()
    expect(mocks.updateAgent).toHaveBeenCalledWith('a1', {
      auto_config: { auto_reply: autoReply({ max_per_hour: 8 }) }
    })
  })

  it('编辑：未改自动回复时不提交 auto_config（旧后端无该字段也一样）', async () => {
    await openModal({ agent: agentVO() })
    expect(wrapper.findComponent(NSwitch).props('value')).toBe(false)
    expect(bodyText()).not.toContain('帖子热度门槛')
    form().name = 'bot2'
    await submit()
    expect(mocks.updateAgent).toHaveBeenCalledWith('a1', { name: 'bot2' })
  })

  it('关闭：折叠字段，但提交时带上保留的完整配置', async () => {
    await openModal({ agent: agentVO({ auto_config: { auto_reply: autoReply() } }) })
    await toggle(false)
    expect(bodyText()).not.toContain('帖子热度门槛')
    await submit()
    expect(mocks.updateAgent).toHaveBeenCalledWith('a1', {
      auto_config: { auto_reply: autoReply({ enabled: false }) }
    })
  })

  it('首次开启：预填目标与窗口；缺帖子门槛时拦截提交', async () => {
    await openModal({ agent: agentVO() })
    await toggle(true)
    expect(form().auto_reply.targets).toEqual(['post'])
    expect(form().auto_reply.window_hours).toBe(24)
    await submit()
    expect(mocks.updateAgent).not.toHaveBeenCalled()
    expect(bodyText()).toContain('回复帖子时热度门槛须 ≥ 1')
  })

  it('评论目标两个门槛都为 0 时拦截提交', async () => {
    await openModal({
      agent: agentVO({ auto_config: { auto_reply: autoReply() } })
    })
    form().auto_reply.comment_like_min = 0
    await submit()
    expect(mocks.updateAgent).not.toHaveBeenCalled()
    expect(bodyText()).toContain('回复评论时点赞数或回复数门槛至少一个 ≥ 1')
  })

  it('圈内创建：带 circle_id 与 auto_config，展示圈内说明', async () => {
    await openModal({ scope: 'circle', circleId: 'c1' })
    expect(bodyText()).toContain('圈内机器人只回复本圈内容')
    Object.assign(form(), { name: 'cbot', model: 'm', trigger_keywords: ['k'] })
    await toggle(true)
    form().auto_reply.post_hot_min = 50
    await submit()
    expect(mocks.createCircleAgent).toHaveBeenCalledTimes(1)
    const payload = mocks.createCircleAgent.mock.calls[0][0]
    expect(payload.circle_id).toBe('c1')
    expect(payload.auto_config).toEqual({
      auto_reply: {
        enabled: true,
        targets: ['post'],
        post_hot_min: 50,
        comment_like_min: 0,
        comment_reply_min: 0,
        window_hours: 24,
        max_per_hour: 0
      }
    })
  })

  it('圈内创建：未开启自动回复时不带 auto_config', async () => {
    await openModal({ scope: 'circle', circleId: 'c1' })
    Object.assign(form(), { name: 'cbot', model: 'm', trigger_keywords: ['k'] })
    await submit()
    expect(mocks.createCircleAgent.mock.calls[0][0]).not.toHaveProperty('auto_config')
  })

  it('圈内编辑（管理员）：可改自动回复，后端错误原样展示', async () => {
    mocks.updateCircleAgent.mockRejectedValue(new Error('auto_config.auto_reply is invalid'))
    await openModal({
      scope: 'circle',
      canEditCredentials: false,
      agent: agentVO({ auto_config: { auto_reply: autoReply() } })
    })
    form().auto_reply.window_hours = 48
    await submit()
    expect(mocks.updateCircleAgent).toHaveBeenCalledWith('a1', {
      auto_config: { auto_reply: autoReply({ window_hours: 48 }) }
    })
    expect(mocks.message.error).toHaveBeenCalledWith('auto_config.auto_reply is invalid')
  })
})
