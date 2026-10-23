import request from '@/utils/request'

// ==================== 圈内内容审核（/circle/moderation）====================
// 权限：本圈圈主（30）/ 管理员（20）且成员状态正常；其余一律 403（code=203），不区分原因。
// 错误码按信封 code 区分：201=参数/游标非法（400）、203=无权限（403）、204=帖子不存在或已不在审核中（404）。

/**
 * 获取本圈待审帖子列表（status=2 且未删除，按发帖时间倒序）
 * @param {Object} params - 查询参数
 * @param {string} params.circle_id - 圈子 ID（必填）
 * @param {number} [params.size] - 每页条数，≤0 或 >100 按 20 处理
 * @param {string} [params.cursor] - 上一页返回的 cursor 原样回传；首页不传。非法游标返回 201
 * @returns {Promise} data: { posts: ModerationPost[], size: number, cursor: string }
 *   cursor 为空字符串 = 没有更多；
 *   posts[]：id / circle_id / user_id / type / title / summary / content（全文）/ media_extra（图片 URL 数组）/
 *   status / create_time / author_name / author_avatar / ai_verdict。
 *   ai_verdict 可能为 null（AI 尚未处理）；字段 decision / hit_hazards（按概率降序）/ hazards（key→0–1）/
 *   severity（0–3，AI 不可用时 null）/ severity_confidence（0–1）/ model / error_msg（非空=AI 不可用）/ create_time
 */
export function getModerationPosts(params) {
  return request({
    url: '/circle/moderation/posts',
    method: 'get',
    params
  })
}

/**
 * 人工审核待审帖子：通过（→ status=1）或驳回（→ status=3），两种结果都会通知作者。
 * 并发处理同一帖子只有一次生效，其余返回 204（前端提示「已被处理」并刷新列表）。
 * approve 后进入搜索 / 圈子列表依赖 CDC 同步，有数秒延迟。
 * @param {Object} data - 审核数据
 * @param {string} data.circle_id - 帖子所在圈子 ID（须与帖子实际所属圈子一致）
 * @param {string} data.post_id - 待审帖子 ID
 * @param {'approve'|'reject'} data.action - 必须显式传，其他值（含空）返回 201
 * @param {string} [data.reason] - 备注，≤200 字符（超出截断）；只记入审核日志，不展示给作者
 * @returns {Promise} data: { post_id: string, status: number }
 */
export function reviewModerationPost(data) {
  return request({
    url: '/circle/moderation/review',
    method: 'post',
    data
  })
}
