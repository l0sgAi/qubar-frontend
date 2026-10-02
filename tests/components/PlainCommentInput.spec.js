import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mocks = vi.hoisted(() => ({
  submit: vi.fn(),
  requireLogin: vi.fn(),
  message: { success: vi.fn(), error: vi.fn() }
}))

vi.mock('@/composables/useCommentSubmit', async () => {
  const { ref } = await import('vue')
  return { useCommentSubmit: () => ({ submitting: ref(false), submit: mocks.submit }) }
})
vi.mock('@/utils/guest-action', () => ({ requireLogin: mocks.requireLogin }))
vi.mock('naive-ui', async (importOriginal) => ({
  ...(await importOriginal()),
  useMessage: () => mocks.message
}))

const { default: PlainCommentInput } = await import('@/components/post/detail/PlainCommentInput.vue')
const { createTestI18n } = await import('../helpers/plugins')

const login = () => {
  localStorage.setItem('qubar_token', 'tok')
  localStorage.setItem('qubar_token_expire', String(Date.now() + 60_000))
}

const mountInput = (props = {}) => mount(PlainCommentInput, {
  props: { postId: 'p1', ...props },
  global: { plugins: [createTestI18n()] }
})

const sendButton = (wrapper) => wrapper.findAll('button').find(b => b.text().includes('发送'))

describe('PlainCommentInput', () => {
  beforeEach(() => {
    mocks.submit.mockReset()
    mocks.requireLogin.mockReset()
    mocks.message.success.mockReset()
    mocks.message.error.mockReset()
  })

  it('访客：显示登录引导，点击触发 requireLogin', async () => {
    const wrapper = mountInput()
    expect(wrapper.find('textarea').exists()).toBe(false)
    await wrapper.find('.guest-prompt').trigger('click')
    expect(mocks.requireLogin).toHaveBeenCalledWith('comment')
  })

  it('内容为空时发送按钮禁用', () => {
    login()
    const wrapper = mountInput()
    expect(sendButton(wrapper).attributes('disabled')).toBeDefined()
  })

  it('顶层评论：提交后提示、emit submit 并清空', async () => {
    login()
    mocks.submit.mockResolvedValue({ id: 'c1' })
    const wrapper = mountInput()
    await wrapper.find('textarea').setValue('第一行\n第二行')
    await sendButton(wrapper).trigger('click')
    await flushPromises()
    expect(mocks.submit).toHaveBeenCalledWith({ postId: 'p1', content: '第一行\n第二行', reply: null })
    expect(mocks.message.success).toHaveBeenCalledWith('评论成功')
    expect(wrapper.emitted('submit')[0]).toEqual([{ id: 'c1' }])
    expect(wrapper.find('textarea').element.value).toBe('')
  })

  it('回复模式：带 reply 参数，占位符含对方名字，可取消', async () => {
    login()
    mocks.submit.mockResolvedValue({ id: 'r1' })
    const wrapper = mountInput({ rootId: 'c1', replyToId: 'r0', replyToName: 'Bob' })
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('回复 Bob')
    await wrapper.find('textarea').setValue('yo')
    await sendButton(wrapper).trigger('click')
    await flushPromises()
    expect(mocks.submit).toHaveBeenCalledWith({
      postId: 'p1',
      content: 'yo',
      reply: { rootId: 'c1', replyToId: 'r0', replyToName: 'Bob' }
    })
    expect(mocks.message.success).toHaveBeenCalledWith('回复成功')

    const cancel = wrapper.findAll('button').find(b => b.text() === '取消')
    await cancel.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('失败：提示错误，不清空、不 emit', async () => {
    login()
    mocks.submit.mockRejectedValue(new Error('服务异常'))
    const wrapper = mountInput()
    await wrapper.find('textarea').setValue('hi')
    await sendButton(wrapper).trigger('click')
    await flushPromises()
    expect(mocks.message.error).toHaveBeenCalledWith('服务异常')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('textarea').element.value).toBe('hi')
  })

  it('只有空白时不提交', async () => {
    login()
    const wrapper = mountInput()
    await wrapper.find('textarea').setValue('   ')
    await wrapper.vm.$nextTick()
    expect(sendButton(wrapper).attributes('disabled')).toBeDefined()
    expect(mocks.submit).not.toHaveBeenCalled()
  })
})
