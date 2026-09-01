import request from '@/utils/request'

/**
 * 更新用户个人信息
 * @param {Object} data - 更新数据
 * @param {string} data.username - 用户名（1-50字符）
 * @param {string} data.avatar_url - 头像URL
 * @returns {Promise}
 */
export function updateUserInfo(data) {
  return request({
    url: '/user/update',
    method: 'put',
    data
  })
}

/**
 * 重置 / 设置密码（PUT /user/update 的部分更新语义，不校验旧密码）
 * 后端要求 password 与 confirm_password 成对提交，二者缺一报 400。
 * @param {string} password - 新密码（最小 6 字符；原样提交，不 trim）
 * @param {string} confirmPassword - 确认密码，须与 password 完全一致
 * @returns {Promise} 成功 resolve 响应体；业务错误（code!==200）由 request 拦截器 reject
 */
export function resetPassword(password, confirmPassword) {
  return request({
    url: '/user/update',
    method: 'put',
    data: {
      password,
      confirm_password: confirmPassword
    }
  })
}

/**
 * 搜索用户列表（@选人）
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 搜索词，匹配 username（权重高）和 email；空串 = 返回全部用户（按注册时间倒序）
 * @param {number} params.size - 每页数量，默认20，最大100（≤0 或 >100 按 20 处理）
 * @param {string} params.search_after - 深度分页参数（上一页响应里的 JSON 字符串，axios 会自动 URL encode；首页不传）
 * @param {string} params.circle_id - 圈子作用域：圈内 @选人时必传圈子 uuid（普通用户 + 全局机器人 + 本圈机器人可见，
 *                            其他圈子的机器人被排除）；不传 = 全站搜索（所有圈内机器人不可见）
 * @returns {Promise}
 */
export function searchUsers(params) {
  return request({
    url: '/user/search',
    method: 'get',
    params
  })
}

/**
 * 获取用户详情
 * @param {string} userId - 用户ID(UUIDv7)
 * @returns {Promise}
 */
export function getUserDetail(userId) {
  return request({
    url: `/user/detail/${userId}`,
    method: 'get'
  })
}
