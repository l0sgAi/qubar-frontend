/**
 * 私密圈邀请（后端 v0.7.0，l0sgAi/qubar#169）的常量与纯函数，不含文案。
 */
import { isManager, isPrivateJoinType } from '@/constants/circle'

// 邀请链接有效期（小时）：默认 7 天，范围 1 小时 ~ 30 天
export const INVITE_EXPIRE_DEFAULT_HOURS = 168
export const INVITE_EXPIRE_MIN_HOURS = 1
export const INVITE_EXPIRE_MAX_HOURS = 720

// 邀请链接次数上限：不填为不限，范围 1–10000
export const INVITE_MAX_USES_MIN = 1
export const INVITE_MAX_USES_MAX = 10000

// 列表单页大小（后端 ≤0 或 >100 按 20 处理）
export const INVITE_PAGE_SIZE = 20

// 邀请链接展示状态
export const INVITE_LINK_STATUS = {
  ACTIVE: 'active',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
  USED_UP: 'usedUp'
}

/**
 * 链接展示状态：可用 = !revoked && !expired && (max_uses == null || used_count < max_uses)。
 * 不可用时按 已撤销 > 已过期 > 已用完 取一个原因展示。
 */
export function inviteLinkStatus(link) {
  if (!link) return INVITE_LINK_STATUS.EXPIRED
  if (link.revoked) return INVITE_LINK_STATUS.REVOKED
  if (link.expired) return INVITE_LINK_STATUS.EXPIRED
  if (link.max_uses != null && (link.used_count || 0) >= link.max_uses) return INVITE_LINK_STATUS.USED_UP
  return INVITE_LINK_STATUS.ACTIVE
}

/** 只有私密圈的圈主 / 管理员能管理邀请（公开圈生成链接返回 400） */
export function canManageInvites(circle) {
  return !!circle && isManager(circle.member_role) && isPrivateJoinType(circle.join_type)
}

/** 前端落地页路径（token 为 base64url，可直接放进 path） */
export function invitePath(token) {
  return `/invite/${token}`
}

/** 分享地址：当前站点 origin + 落地页路径 */
export function inviteUrl(token, origin = window.location.origin) {
  return `${origin}${invitePath(token)}`
}

const codeIs = (error, code, status) => error?.code === code || error?.code === status || error?.status === status

/**
 * POST /circle/invite/accept 失败 → i18n key（不展示后端英文 message）。
 * 信封 code 与 HTTP 状态一一对应（203↔403、204↔404），两者都认。
 */
export function acceptInviteErrorKey(error) {
  if (codeIs(error, 203, 403)) return 'circle.invite.landing.error.banned'
  if (codeIs(error, 204, 404)) return 'circle.invite.landing.error.invalid'
  return 'circle.invite.landing.error.generic'
}

/** 预览 / 接受返回 404：邀请已失效（不区分原因） */
export function isInviteInvalidError(error) {
  return codeIs(error, 204, 404)
}
