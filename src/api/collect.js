import request from '@/utils/request'

/**
 * 收藏 / 取消收藏（幂等切换）
 * 同一帖子连续调用会在 收藏↔取消 间切换。
 * @param {Object} data
 * @param {string} data.post_id - 帖子ID(UUIDv7，必填)
 * @returns {Promise} data: { is_collected: boolean, post_id: string }
 *   —— is_collected 为「本次切换后」的状态，以服务端为准
 */
export function toggleCollect(data) {
  return request({
    url: '/collect/toggle',
    method: 'post',
    data
  })
}

/**
 * 我的收藏列表（按收藏时间倒序，游标分页）
 * 失效帖（被删除/封禁）由后端静默过滤，列表长度可能小于 size 属正常。
 * @param {Object} params
 * @param {number} params.size - 每页数量，默认20，<=0 或 >100 后端回退为20
 * @param {string} [params.search_after] - 上一页响应游标，原样透传（首页不传 / 空串）
 * @param {string} [params.keyword] - 关键字（后端规划中，传入即前向兼容）
 * @returns {Promise} data: { posts: PostListItem[], total: number, size: number, search_after: string }
 *   —— search_after 为空串表示已到末页
 */
export function getCollectedPosts(params) {
  return request({
    url: '/collect/posts',
    method: 'get',
    params
  })
}
