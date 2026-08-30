/**
 * 圈子模块枚举常量与权限判断（纯函数，不含文案）。
 * 文案映射见 src/composables/useCircleMeta.js（依赖 i18n）。
 */

// 成员角色（与后端枚举一致，勿改数值）
export const CIRCLE_ROLE = {
  MEMBER: 10,
  ADMIN: 20,
  OWNER: 30
}

// 成员状态
export const MEMBER_STATUS = {
  PENDING: 0, // 待审核
  ACTIVE: 1, // 正常在圈
  MUTED: 2, // 禁言中（仍是成员）
  BANNED: 3, // 已拉黑（已不在圈）
  EXITED: 4 // 已退出（主动退圈或解除拉黑后的落点）
}

// 加入方式
export const JOIN_TYPE = {
  DIRECT: 0,
  REVIEW: 1,
  PRIVATE: 2
}

// PUT /circle/update 清除 category_id 时传的全零 UUID
export const EMPTY_CATEGORY_ID = '00000000-0000-0000-0000-000000000000'

// 禁言时长上限（小时）：1 小时 ~ 30 天
export const MUTE_DURATION_MIN = 1
export const MUTE_DURATION_MAX = 720

// 成员列表单页大小（后端 ≤0 或 >100 按 20 处理）
export const MEMBER_PAGE_SIZE = 20

/** 是否为管理侧角色（圈主或管理员） */
export function isManager(role) {
  return role === CIRCLE_ROLE.ADMIN || role === CIRCLE_ROLE.OWNER
}

/** 是否圈主 */
export function isOwner(role) {
  return role === CIRCLE_ROLE.OWNER
}

/**
 * 通用操作规则：只能操作角色严格低于自己的人（圈主 > 管理员 > 成员）。
 * 目标角色 ≥ 自己（含自己）一律不可操作。
 */
export function canTarget(myRole, targetRole) {
  return myRole > targetRole
}

/**
 * 禁言/解禁/拉黑/解黑/审核的额外限制：
 * 管理员仅可对普通成员(10)操作，圈主不受限（仍需满足 canTarget）。
 */
export function canModerate(myRole, targetRole) {
  if (!canTarget(myRole, targetRole)) return false
  if (myRole === CIRCLE_ROLE.ADMIN) return targetRole === CIRCLE_ROLE.MEMBER
  return true
}
