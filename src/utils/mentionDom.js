// @提及 渲染侧链接化：遍历 MdPreview 产出的 HTML，把「可解析到 uuid 的 @用户名」
// 文本替换为可点击 <a>。只用 createElement + textContent 构建，无注入面。
// 提交内容保持纯文本，本工具只在渲染层生效。
import { MENTION_LEAD, NAME_CHARS } from './mention'
import { peekUserId, resolveUsernames } from './mentionResolve'

// 这些容器内的 @ 不做链接化：代码块/行内码/链接（含 linkify 出的 mailto/URL）
const SKIP_TAGS = new Set(['A', 'PRE', 'CODE', 'KBD', 'SCRIPT', 'STYLE', 'TEXTAREA', 'BUTTON', 'SVG'])
// 单轮最多回查多少个未知用户名：防止长评论列表首刷的请求风暴
const MAX_UNKNOWN_PER_PASS = 12
// 空格感知候选扫描：@ 后 1~3 个空格分隔词（覆盖「John Doe」「王 小明」类名字）。
// 不依赖已知名集合即可圈出候选跨度，再按词数从多到少回查缓存（整名优先，miss 缩短一词），
// 打破「regex 要已知名才能整名匹配 / 已知名要匹配成功才会被回灌」的死锁
const MENTION_SCAN_RE = new RegExp(
  `${MENTION_LEAD}@((?:${NAME_CHARS}+)(?: (?:${NAME_CHARS}+)){0,2})(?!${NAME_CHARS})`,
  'g'
)

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
    const re = MENTION_SCAN_RE
    re.lastIndex = 0
    let frag = null
    let last = 0
    let m
    while ((m = re.exec(text)) !== null) {
      // 词数从多到少渐进回查：最长已命中前缀即提及跨度。
      // 遇到未查过的候选先排队解析（整名优先），本轮该跨度保持纯文本，
      // 解析落地后 onUpdate 重跑本 pass 再建链——防整名确认前短词误链
      const words = m[2].split(' ')
      let hit = null
      let pendingName = null
      for (let k = words.length; k >= 1; k--) {
        const name = words.slice(0, k).join(' ')
        const id = peekUserId(name)
        if (id) {
          hit = { name, id }
          break
        }
        if (id === null) continue // 已确认查无此人 → 缩短一词再试
        pendingName = name
        break
      }
      if (hit) {
        if (!frag) frag = document.createDocumentFragment()
        const lead = m[1] || ''
        const tokenStart = m.index + lead.length
        frag.append(text.slice(last, tokenStart))
        const a = document.createElement('a')
        a.className = 'post-mention'
        a.href = `/user/${hit.id}`
        a.dataset.userId = hit.id
        a.textContent = `@${hit.name}`
        frag.append(a)
        last = tokenStart + 1 + hit.name.length
        mutated = true
      } else if (pendingName) {
        unknown.add(pendingName)
      }
      // 零宽匹配死循环保险
      if (m.index === re.lastIndex) re.lastIndex += 1
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
