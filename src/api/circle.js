import request from '@/utils/request'

/**
 * 获取分类列表
 * @returns {Promise} 返回分类列表
 */
export function getCategories() {
  return request({
    url: '/category/get',
    method: 'get'
  })
}

/**
 * 创建兴趣圈
 * @param {Object} data - 兴趣圈数据
 * @param {string} data.name - 兴趣圈名称
 * @param {string} data.slug - 唯一标识符（用于URL SEO）
 * @param {string} data.avatar_url - 兴趣圈头像URL
 * @param {string} data.cover_url - 背景图URL
 * @param {string} data.description - 描述信息
 * @param {string} data.rule - 圈子规则/公告
 * @param {string} data.category_id - 分类ID(UUIDv7)
 * @param {number} data.join_type - 加入方式 0=直接加入 1=需要审核 2=私密圈子
 * @returns {Promise}
 */
export function createCircle(data) {
  return request({
    url: '/circle/create',
    method: 'post',
    data
  })
}

/**
 * 搜索兴趣圈（使用 Elasticsearch search_after 分页）
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键字，匹配圈子名称和描述
 * @param {number} params.size - 每页数量，范围 1-100，默认 20
 * @param {string} params.search_after - 上一页返回的 search_after 值（JSON字符串）
 * @returns {Promise}
 */
export function searchCircles(params) {
  return request({
    url: '/circle/list',
    method: 'get',
    params
  })
}

/**
 * 获取圈子详情
 * @param {string} id - 圈子ID(UUIDv7)
 * @returns {Promise} 返回圈子详情 CircleDetailVO
 */
export function getCircleDetail(id) {
  return request({
    url: `/circle/detail/${id}`,
    method: 'get'
  })
}

/**
 * 加入兴趣圈
 * @param {Object} data - 加入数据
 * @param {string} data.circle_id - 圈子ID(UUIDv7)
 * @returns {Promise}
 */
export function joinCircle(data) {
  return request({
    url: '/circle/join',
    method: 'post',
    data
  })
}

/**
 * 退出兴趣圈
 * @param {Object} data - 退出数据
 * @param {string} data.circle_id - 圈子ID(UUIDv7)
 * @returns {Promise}
 */
export function leaveCircle(data) {
  return request({
    url: '/circle/leave',
    method: 'post',
    data
  })
}

/**
 * 获取圈子帖子列表
 * @param {Object} params - 查询参数
 * @param {string} params.circle_id - 圈子ID（必填，UUIDv7）
 * @param {number} params.type - 1=近期热点 2=最新 3=精华（必填）
 * @param {number} params.size - 每页数量，默认20，上限100
 * @param {string} params.search_after - 分页游标（上页响应中的值）
 * @returns {Promise}
 */
export function getCirclePosts(params) {
  return request({
    url: '/circle/posts',
    method: 'get',
    params
  })
}
