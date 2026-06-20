import request from '@/utils/request'

/**
 * 发表评论
 * @param {Object} data - 评论数据
 * @param {string} data.post_id - 帖子ID(UUIDv7)
 * @param {string} data.content - 评论内容
 * @returns {Promise}
 */
export function createComment(data) {
  return request({
    url: '/comment/create',
    method: 'post',
    data
  })
}

/**
 * 获取顶层评论列表
 * @param {Object} params
 * @param {string} params.post_id - 帖子ID(UUIDv7)
 * @param {number} [params.sort] - 0=按点赞倒序（默认），1=按时间倒序
 * @param {string} [params.cursor] - 游标，首页不传
 * @returns {Promise}
 */
export function getCommentList(params) {
  return request({
    url: '/comment/list',
    method: 'get',
    params
  })
}

/**
 * 加载子回复列表（页码分页）
 * @param {Object} params
 * @param {string} params.root_id - 根评论ID(UUIDv7)
 * @param {number} [params.sort] - 0=按时间倒序（默认），1=按点赞倒序
 * @param {number} [params.page] - 页码，从1开始
 * @param {number} [params.page_size] - 每页数量，默认5
 * @returns {Promise}
 */
export function getCommentReplies(params) {
  return request({
    url: '/comment/replies',
    method: 'get',
    params
  })
}
