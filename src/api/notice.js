import request from '@/utils/request'

/**
 * 获取通知列表（keyset 游标分页，最新在前）
 * @param {Object} params
 * @param {number} [params.type] - 0=全部（默认），1-6 按类型过滤
 * @param {number} [params.size] - 每页条数，默认20，>100 回落20
 * @param {string} [params.cursor] - 上一页返回的游标，首页不传；响应 cursor 为空字符串=没有更多
 * @returns {Promise} data: { notices, size, cursor }
 */
export function getNoticeList(params) {
  return request({
    url: '/notice/list',
    method: 'get',
    params
  })
}

/**
 * 获取未读通知数（红点/角标）
 * @returns {Promise} data: { unread_count }
 */
export function getUnreadCount() {
  return request({
    url: '/notice/unread-count',
    method: 'get'
  })
}

/**
 * 批量标记已读（幂等，可安全重试；仅标记当前用户自己的通知）
 * @param {string[]} ids - 通知ID列表（uuid，1-100 个）
 * @returns {Promise} data 为 null，以 code 判成功
 */
export function markNoticesRead(ids) {
  return request({
    url: '/notice/read',
    method: 'post',
    data: { ids }
  })
}

/**
 * 全部标记已读（未读数归零）
 * @returns {Promise} data 为 null，以 code 判成功
 */
export function markAllNoticesRead() {
  return request({
    url: '/notice/read-all',
    method: 'post'
  })
}
