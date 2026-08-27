// @提及正文匹配工具：选人时正文插入「@用户名 」展示文本，提交前需确认
// 正文中仍存在完整的 @用户名 token，才把对应 uuid 传给后端。
//
// 边界规则三处共用（本文件 / 编辑器内联弹窗 MentionTrigger / 渲染侧链接化 mentionDom），
// 任何一侧调整必须同步：
// - 前导：行首或空白/常见左括号引号。字母数字与 . / : @ 均不可作前导，
//   否则邮箱 xiaoming@example.com 会误匹配出 token「example」。
// - 后置：@用户名 之后不能再出现用户名可含字符或另一个 @，
//   否则 @alice 会误中 @alice2。

const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// 用户名字符集：字母数字下划线/连字符/中日韩统一表意文字
const NAME_CHARS = String.raw`[A-Za-z0-9_一-鿿-]`
// 合法前导字符集合（捕获组 1 = 前导字符，行首时为空串）
export const MENTION_LEAD = String.raw`(^|[\s(\[{>"'“‘《【])`
// 完整用户名长度上限
export const MENTION_NAME_MAX = 30
// 编辑器内 @ 后允许的最长搜索关键词
export const MENTION_KEYWORD_MAX = 20

// 渲染侧完整 token（g 标志逐个 exec；捕获组 1=前导 组 2=用户名）
export const MENTION_FULL_RE = new RegExp(
  `${MENTION_LEAD}@(${NAME_CHARS}{1,${MENTION_NAME_MAX}})(?!${NAME_CHARS}|@)`,
  'g'
)
// 编辑侧 non-global：光标前文本须以「可选前导 + @ + 关键词」结尾
export const MENTION_TAIL_RE = new RegExp(`(?:${MENTION_LEAD})@(${NAME_CHARS}{0,${MENTION_KEYWORD_MAX}})$`)

// 完整 token 匹配：确认正文中仍存在完整的 @用户名
export const hasMentionToken = (content, username) => {
  if (!content || !username) return false
  return new RegExp(`${MENTION_LEAD}@${escapeRegExp(username)}(?!${NAME_CHARS}|@)`).test(content)
}

// 提取正文中所有完整 @用户名（去重、保持出现顺序），渲染侧用于回查 uuid
export const extractMentionTokens = (text) => {
  if (!text) return []
  MENTION_FULL_RE.lastIndex = 0
  const names = []
  let m
  while ((m = MENTION_FULL_RE.exec(text)) !== null) {
    if (!names.includes(m[2])) names.push(m[2])
    // 零宽匹配死循环保险
    if (m.index === MENTION_FULL_RE.lastIndex) MENTION_FULL_RE.lastIndex += 1
  }
  return names
}

// 过滤出正文中仍存在的提及，返回用户 id 列表
export const filterMentionedIds = (content, users) =>
  users.filter(u => hasMentionToken(content, u.username)).map(u => u.id)
