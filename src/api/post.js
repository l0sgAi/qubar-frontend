import request from '@/utils/request'

/**
 * 获取圈子列表（用于发帖时选择圈子）
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @returns {Promise}
 */
export function getCircles(params) {
  return request({
    url: '/circle/list',
    method: 'get',
    params
  })
}

/**
 * 获取用户已加入的圈子列表（用于发帖时选择圈子）
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 搜索关键词（可选）
 * @param {number} params.size - 每页数量，默认20，最大100
 * @param {string} params.search_after - 深度分页参数（JSON字符串，可选）
 * @returns {Promise}
 */
export function getMyCircles(params) {
  return request({
    url: '/circle/my',
    method: 'get',
    params
  })
}

/**
 * 创建帖子
 * @param {Object} data - 帖子数据
 * @param {string} data.circle_id - 所属圈子ID(UUIDv7)
 * @param {string} data.title - 标题（必填）
 * @param {string} data.summary - 摘要/关键词（可选）
 * @param {string} data.content - 正文内容（Markdown格式）
 * @param {Object} data.media_extra - 媒体扩展信息
 * @returns {Promise}
 */
export function createPost(data) {
  return request({
    url: '/post/create',
    method: 'post',
    data
  })
}

/**
 * 搜索帖子列表
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 搜索关键词（可选）
 * @param {string} params.circle_id - 圈子ID（可选，UUIDv7）
 * @param {number} params.size - 每页数量，默认20
 * @param {string} params.search_after - 深度分页参数（JSON字符串，可选）
 * @returns {Promise}
 */
export function searchPosts(params) {
  return request({
    url: '/post/list',
    method: 'get',
    params
  })
}

/**
 * 获取帖子详情
 * @param {string} id - 帖子ID(UUIDv7)
 * @returns {Promise}
 */
export function getPostDetail(id) {
  return request({
    url: `/post/detail/${id}`,
    method: 'get'
  })
}
