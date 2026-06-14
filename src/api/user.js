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
 * 上传图片
 * @param {File} file - 图片文件
 * @returns {Promise} 返回包含 URL 的响应
 */
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 搜索用户列表
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 搜索关键词（可选）
 * @param {number} params.size - 每页数量，默认20，最大100
 * @param {string} params.search_after - 深度分页参数（JSON字符串，可选）
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
