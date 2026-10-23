// 消息中心展示用的纯函数：文案渲染与跳转目标，供 Notifications.vue 使用

// 文案模板按 notice_type 映射到 notice.templates.*
// 7/8 为审核结果通知（l0sgAi/qubar#118），9–11 待后端 l0sgAi/qubar#154 上线后再加
export const NOTICE_TEMPLATE_KEYS = {
  1: 'likePost',
  2: 'likeComment',
  3: 'collectPost',
  4: 'commentPost',
  5: 'replyComment',
  6: 'mention',
  7: 'postApproved',
  8: 'postRejected'
}

// 系统类通知：后端恒不返回 actor（不暴露审核人），头像用系统图标而不是首字母兜底
export const SYSTEM_NOTICE_TYPES = [7, 8]

export const isSystemNotice = (item) => SYSTEM_NOTICE_TYPES.includes(item.notice_type)

// actor 缺省（用户注销等降级场景）兜底为「有人」；未知类型直接显示 snippet
export const renderNoticeText = (item, t) => {
  const key = NOTICE_TEMPLATE_KEYS[item.notice_type]
  if (!key) return item.snippet || ''
  const actor = item.actor?.username || t('notice.someone')
  return t(`notice.templates.${key}`, { actor, snippet: item.snippet || '' })
}

// 跳转目标：帖子详情（有 comment_id 带上定位参数）；无 post_id 时返回 null，降级为普通块。
// 7/8 不带 comment_id，直接进详情；8 的驳回状态与帖子不可用空态由详情页处理
export const noticeTarget = (item) => {
  if (!item.post_id) return null
  return {
    path: `/post/${item.post_id}`,
    query: item.comment_id ? { comment_id: item.comment_id } : {}
  }
}
