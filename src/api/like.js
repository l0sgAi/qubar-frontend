import request from '@/utils/request'

/**
 * 点赞 / 取消点赞
 * @param {Object} data
 * @param {'post'|'comment'} data.type
 * @param {string} data.target_id - 帖子或评论ID(UUIDv7)
 * @param {'like'|'unlike'} [data.action] - 显式目标状态（幂等，可安全重试）；省略则按服务端当前状态切换，勿自动重试
 * @returns {Promise} data: { is_liked: boolean, type: string, target_id: string } —— 以服务端为准
 */
export function toggleLike(data) {
  return request({
    url: '/like/toggle',
    method: 'post',
    data
  })
}
