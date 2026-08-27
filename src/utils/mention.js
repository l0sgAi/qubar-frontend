// @提及正文匹配工具：选人时正文插入「@用户名 」展示文本，提交前需确认
// 正文中仍存在完整的 @用户名 token，才把对应 uuid 传给后端。

const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// 完整 token 匹配：@用户名 后不能再跟用户名可含字符（字母数字下划线/连字符/中日韩文字），
// 否则 @alice 会误中 @alice2，错传 mention_user_ids
export const hasMentionToken = (content, username) => {
  if (!content || !username) return false
  return new RegExp(`@${escapeRegExp(username)}(?![\\w\\u4e00-\\u9fff-])`).test(content)
}

// 过滤出正文中仍存在的提及，返回用户 id 列表
export const filterMentionedIds = (content, users) =>
  users.filter(u => hasMentionToken(content, u.username)).map(u => u.id)
