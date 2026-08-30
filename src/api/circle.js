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

/**
 * 获取圈子成员列表（仅圈主/管理员可用，普通成员返回 403）
 * @param {Object} params - 查询参数
 * @param {string} params.circle_id - 圈子ID（必填，UUIDv7）
 * @param {string} [params.role] - 按角色过滤：'10'/'20'/'30'；不传或 '-1'=全部（注意是字符串）
 * @param {string} [params.status] - 按状态过滤：'0'-'4'；不传或 '-1'=全部（注意是字符串）
 * @param {string} [params.keyword] - 按用户名/邮箱搜索（同一套匹配引擎，username 权重 3 倍，
 *   相关性排序模糊匹配；最多返回 100 个命中用户对应的成员；空=不过滤。
 *   keyword 与 cursor 必须配套：翻页带同一 keyword，关键词变化重置 cursor；
 *   可与 role/status 叠加；响应不含 email；搜索服务不可用返回 code=210）
 * @param {string} [params.cursor] - 上一页返回的 cursor 原样回传；首页不传；空字符串=没有更多页
 * @param {number} [params.size] - 每页数量，≤0 或 >100 按 20 处理
 * @returns {Promise} data: { members: Array, size: number, cursor: string }
 */
export function getCircleMembers(params) {
  return request({
    url: '/circle/members',
    method: 'get',
    params
  })
}

/**
 * 设为/取消管理员（仅圈主可用）
 * @param {Object} data - 操作数据
 * @param {string} data.circle_id - 圈子ID
 * @param {string} data.target_user_id - 目标用户ID
 * @param {number} data.role - 仅接受 20=设为管理员、10=取消管理员恢复普通成员
 * @returns {Promise}
 */
export function setMemberRole(data) {
  return request({
    url: '/circle/manage/role',
    method: 'post',
    data
  })
}

/**
 * 转让圈主（仅圈主可用，不可逆；转让后当前用户立即降为普通成员）
 * @param {Object} data - 操作数据
 * @param {string} data.circle_id - 圈子ID
 * @param {string} data.target_user_id - 目标用户ID（须为正常在圈的非圈主成员）
 * @returns {Promise}
 */
export function transferOwnership(data) {
  return request({
    url: '/circle/manage/transfer',
    method: 'post',
    data
  })
}

/**
 * 禁言成员（圈主/管理员；仅能禁言正常在圈成员，已在禁言中再禁返回 409）
 * @param {Object} data - 操作数据
 * @param {string} data.circle_id - 圈子ID
 * @param {string} data.target_user_id - 目标用户ID
 * @param {number} data.duration_hours - 禁言时长（小时），1-720（30 天）
 * @returns {Promise}
 */
export function muteMember(data) {
  return request({
    url: '/circle/manage/mute',
    method: 'post',
    data
  })
}

/**
 * 解除禁言（圈主/管理员；目标不是禁言中状态返回 409）
 * @param {Object} data - 操作数据
 * @param {string} data.circle_id - 圈子ID
 * @param {string} data.target_user_id - 目标用户ID
 * @returns {Promise}
 */
export function unmuteMember(data) {
  return request({
    url: '/circle/manage/unmute',
    method: 'post',
    data
  })
}

/**
 * 拉黑/踢出成员（圈主/管理员；可拉黑正常或禁言中成员，成员数 -1，对方无法重新申请直到解黑）
 * @param {Object} data - 操作数据
 * @param {string} data.circle_id - 圈子ID
 * @param {string} data.target_user_id - 目标用户ID
 * @returns {Promise}
 */
export function banMember(data) {
  return request({
    url: '/circle/manage/ban',
    method: 'post',
    data
  })
}

/**
 * 解除拉黑（圈主/管理员；解黑后对方落为已退出(4)，不会自动回圈，需重新走加入流程）
 * @param {Object} data - 操作数据
 * @param {string} data.circle_id - 圈子ID
 * @param {string} data.target_user_id - 目标用户ID
 * @returns {Promise}
 */
export function unbanMember(data) {
  return request({
    url: '/circle/manage/unban',
    method: 'post',
    data
  })
}

/**
 * 入圈审核（圈主/管理员；仅对待审核(0)成员有效）
 * @param {Object} data - 审核数据
 * @param {string} data.circle_id - 圈子ID
 * @param {string} data.target_user_id - 目标用户ID
 * @param {boolean} [data.approve] - true=通过（成员数+1），false/缺省=拒绝（落为已退出，可重新申请）
 * @returns {Promise}
 */
export function reviewMember(data) {
  return request({
    url: '/circle/manage/review',
    method: 'post',
    data
  })
}

/**
 * 编辑圈子资料（圈主可改全部字段；管理员仅 avatar/cover/description/rule）。
 * 只传需要修改的字段，未传字段保持不变；一个字段都不传返回 400。
 * 特殊语义：slug 传 "" 清空；category_id 传全零 UUID 清除分类；avatar_url/cover_url/rule 传 "" 清空；description 不可清空。
 * @param {Object} data - 变更字段（按权限裁剪）
 * @param {string} data.circle_id - 圈子ID（必填）
 * @param {string} [data.name] - 圈子名称，1-50 字（仅圈主，重名 409）
 * @param {string} [data.slug] - 唯一标识 ≤60 字（仅圈主，重名 409）
 * @param {number} [data.join_type] - 加入方式 0/1/2（仅圈主）
 * @param {string} [data.category_id] - 分类 UUID（仅圈主）
 * @param {string} [data.avatar_url] - 头像 URL ≤500 字
 * @param {string} [data.cover_url] - 封面 URL ≤500 字
 * @param {string} [data.description] - 简介 1-2000 字
 * @param {string} [data.rule] - 规则 ≤2000 字
 * @returns {Promise}
 */
export function updateCircle(data) {
  return request({
    url: '/circle/update',
    method: 'put',
    data
  })
}
