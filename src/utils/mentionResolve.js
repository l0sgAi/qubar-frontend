// @提及 渲染期 username→uuid 解析器：
// 正文只存纯文本（后端不解析 @），链接化时按需把用户名回查成 uuid 再建链。
// 缓存为模块级，整个会话共享；编辑器选人成功时 seedUsers 回灌，可省一次查询。
import { searchUsers } from '@/api/user'

// 单条内容最多生效 10 人（与 notice.mention.limitTip 文案、MentionPicker 拦截保持同步）
export const MAX_MENTIONS = 10

const store = new Map()   // lower(用户名) -> uuid | null(null=已确认查无此人，负缓存防重复查询)
const pending = new Map() // lower(用户名) -> Promise 合并，避免同名并发重复请求
const retryAt = new Map() // lower(用户名) -> 时间戳：查询失败后的重试冷却，防失败循环轮询
const RETRY_COOLDOWN = 15_000
// 原样大小写的已知用户名（含空格等非常规字符）：供 getMentionFullRe 构建
// 已知名优先匹配。seedUsers / lookup 命中时回灌。
const knownNames = new Set()

// 选人成功即回灌缓存（编辑器内联弹窗 / MentionPicker 共用）
export const seedUsers = (users = []) => {
  users.forEach((u) => {
    if (u?.id && u.username) {
      store.set(String(u.username).toLowerCase(), u.id)
      knownNames.add(String(u.username))
    }
  })
}

// 已知用户名快照（原样大小写），供已知名优先匹配
export const knownUsernames = () => [...knownNames]

// 从内容载体批量回灌提及用户（后端在帖子/评论详情回传 mentions: [{id, username}]）。
// 渲染链接化前调用 → store 精确命中，零搜索请求建链；旧内容无 mentions 时静默跳过，
// 前端回退到搜索反查（mentionDom 渐进回查逻辑不变）。
export const seedContentMentions = (items = []) => {
  const arr = Array.isArray(items) ? items : []
  arr.forEach((it) => {
    if (Array.isArray(it?.mentions) && it.mentions.length) seedUsers(it.mentions)
  })
}

// 立即取已知映射：uuid / null(确认不存在) / undefined(未知待解析)
export const peekUserId = username => store.get(String(username || '').toLowerCase())

function lookup(name) {
  return searchUsers({ keyword: name, size: 20 })
    .then((res) =>
    {
      const hit = (res.data?.data || []).find(
        u => String(u.username || '').toLowerCase() === String(name).toLowerCase()
      )
      const id = hit?.id || null
      if (hit?.username) knownNames.add(String(hit.username))
      store.set(name.toLowerCase(), id)
      retryAt.delete(name.toLowerCase())
      return id
    })
    .catch((e) => {
      console.error('提及用户解析失败:', e)
      // 失败不写负缓存；进入冷却窗口，窗口过后下一轮 pass 自动重试
      retryAt.set(name.toLowerCase(), Date.now() + RETRY_COOLDOWN)
      return null
    })
}

// 批量解析未知用户名，全部落地后回调一次 onUpdate（供渲染层重跑链接化 pass）
export const resolveUsernames = async (names, onUpdate) => {
  const targets = [...new Set(names.map(n => String(n).toLowerCase()))]
    .filter(n => !store.has(n))                       // 已有结论（含负缓存）的不再查
    .filter(n => (retryAt.get(n) || 0) <= Date.now()) // 冷却中的跳过
  if (!targets.length) { return }

  for (const n of targets) {                          // 顺序执行避免并发轰炸
    let p = pending.get(n)
    if (!p) {
      p = lookup(n).finally(() => pending.delete(n))
      pending.set(n, p)
    }
    await p
  }
  onUpdate?.()
}
