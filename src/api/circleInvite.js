import request from '@/utils/request'

// 私密圈邀请（后端 v0.7.0，l0sgAi/qubar#169）。管理接口仅圈主 / 管理员可用，非管理侧返回 403；
// 生成链接、添加邮箱只对私密圈（join_type=2）开放，公开圈返回 400。

/**
 * 生成邀请链接（管理员及以上，仅私密圈）
 * token 只在本次响应里出现，列表接口不再返回，丢失只能重新生成。
 * @param {Object} data
 * @param {string} data.circle_id - 圈子ID(UUIDv7)
 * @param {number} [data.expire_hours] - 有效期（小时），1–720；不传 / 0 = 默认 168（7 天）
 * @param {number|null} [data.max_uses] - 次数上限，1–10000；不传 / null = 不限
 * @returns {Promise} data: { id, token, expire_time, max_uses }
 */
export function createInviteLink(data) {
  return request({
    url: '/circle/invite/link/create',
    method: 'post',
    data
  })
}

/**
 * 邀请链接列表（管理员及以上）：按创建时间倒序，含已撤销 / 已过期，不返回 token
 * @param {Object} params
 * @param {string} params.circle_id - 圈子ID(UUIDv7)
 * @param {number} [params.page] - 页码，从 1 开始
 * @param {number} [params.size] - 每页条数，≤0 或 >100 按 20 处理
 * @returns {Promise} 分页信封：{ data: Array, total, page, per_page }
 */
export function getInviteLinks(params) {
  return request({
    url: '/circle/invite/link/list',
    method: 'get',
    params
  })
}

/**
 * 撤销邀请链接（管理员及以上），重复撤销幂等成功
 * @param {Object} data
 * @param {string} data.link_id - 链接ID
 * @returns {Promise}
 */
export function revokeInviteLink(data) {
  return request({
    url: '/circle/invite/link/revoke',
    method: 'post',
    data
  })
}

/**
 * 邀请预览（访客可读）。token 无效 / 过期 / 撤销 / 用完 / 圈子改公开一律 404，不区分原因
 * @param {string} token - 邀请 token（43 位 base64url）
 * @returns {Promise} data: { name, avatar_url, member_count }
 */
export function getInvitePreview(token) {
  return request({
    url: '/circle/invite/preview',
    method: 'get',
    params: { token }
  })
}

/**
 * 通过邀请链接加入（需登录）：被拉黑 403、链接失效 404；已是成员幂等成功（already_member=true）
 * @param {Object} data
 * @param {string} data.token - 邀请 token
 * @returns {Promise} data: { circle_id, already_member }
 */
export function acceptInvite(data) {
  return request({
    url: '/circle/invite/accept',
    method: 'post',
    data
  })
}
