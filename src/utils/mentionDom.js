// @提及 渲染侧链接化：遍历 MdPreview 产出的 HTML，把「可解析到 uuid 的 @用户名」
// 文本替换为可点击 <a>。只用 createElement + textContent 构建，无注入面。
// 提交内容保持纯文本，本工具只在渲染层生效。
import { MENTION_FULL_RE } from './mention'
import { peekUserId, resolveUsernames } from './mentionResolve'

// 这些容器内的 @ 不做链接化：代码块/行内码/链接（含 linkify 出的 mailto/URL）
const SKIP_TAGS = new Set(['A', 'PRE', 'CODE', 'KBD', 'SCRIPT', 'STYLE', 'TEXTAREA', 'BUTTON', 'SVG'])
// 单轮最多回查多少个未知用户名：防止长评论列表首刷的请求风暴
const MAX_UNKNOWN_PER_PASS = 12

const acceptText = (node) => {
  const parent = node.parentElement
  if (!parent || !node.nodeValue || node.nodeValue.indexOf('@') === -1) return NodeFilter.FILTER_REJECT
  // closest('a') 兼顾祖先：链接文本一律跳过
  if (SKIP_TAGS.has(parent.tagName) || parent.closest('a')) return NodeFilter.FILTER_REJECT
  return NodeFilter.FILTER_ACCEPT
}

// 把文本节点内的 @token 改写为链接；返回是否发生了 DOM 改写
export const applyMentionLinks = (rootEl, onChange) => {
  if (!rootEl) return false
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, { acceptNode: acceptText })
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)

  const unknown = new Set()
  let mutated = false

  // 收集后统一改写：遍历期间不得变更 DOM 结构
  nodes.forEach((node) => {
    const text = node.nodeValue
    MENTION_FULL_RE.lastIndex = 0
    let frag = null
    let last = 0
    let m
    while ((m = MENTION_FULL_RE.exec(text)) !== null) {
      if (!frag) frag = document.createDocumentFragment()
      const lead = m[1] || ''
      const name = m[2]
      const tokenStart = m.index + lead.length
      frag.append(text.slice(last, tokenStart))
      const id = peekUserId(name)
      if (id) {
        const a = document.createElement('a')
        a.className = 'post-mention'
        a.href = `/user/${id}`
        a.dataset.userId = id
        a.textContent = `@${name}`
        frag.append(a)
      } else {
        // 未解析到 uuid：保持纯文本，避免死链；同时触发后台解析
        unknown.add(name.toLowerCase())
        frag.append(`@${name}`)
      }
      last = m.index + m[0].length
      mutated = true
    }
    if (!frag) return
    frag.append(text.slice(last))
    node.replaceWith(frag)
  })

  if (unknown.size) {
    resolveUsernames([...unknown].slice(0, MAX_UNKNOWN_PER_PASS), onChange)
  }
  return mutated
}
