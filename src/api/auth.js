import request from '@/utils/request'

/**
 * 用户登录
 * @param {string} provider - 登录提供商 (google)
 * @returns {Promise}
 */
export function loginWithOAuth(provider) {
  // 返回后端 OAuth 登录 URL
  return `${request.defaults.baseURL}/auth/${provider}/login`
}

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  return request({
    url: '/user/get',
    method: 'get'
  })
}

/**
 * 退出登录
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 * 发送邮箱验证码
 * @param {string} email
 * @returns {Promise}
 */
export function sendVerificationCode(email, lang) {
  return request({
    url: '/auth/register/send-code',
    method: 'post',
    data: { email, ...(lang && { lang }) }
  })
}

/**
 * 验证邮箱验证码
 * @param {string} email
 * @param {string} code - 6位验证码
 * @returns {Promise}
 */
export function verifyEmailCode(email, code) {
  return request({
    url: '/auth/register/verify',
    method: 'post',
    data: { email, code }
  })
}

/**
 * 邮箱密码注册
 * @param {Object} data - { email, username, password, code }
 * @returns {Promise}
 */
export function registerWithEmail(data) {
  const { email, username, password } = data
  return request({
    url: '/auth/register/complete',
    method: 'post',
    data: { email, username, password }
  })
}

/**
 * 邮箱密码登录
 * @param {Object} data - { email, password }
 * @returns {Promise}
 */
export function loginWithEmail(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}
