import axios from 'axios'
import { useMessage } from 'naive-ui'
import { sanitizePayload } from '@/utils/sanitize'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'https://api.qubar.site',
  headers: {
    // TODO: 解决拦截问题，生产环境可以去掉
    "ngrok-skip-browser-warning": "true" 
  },
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('quba_token')
    if (token) {
      // 设置 sa-token 的请求头
      config.headers['satoken'] = token
    }
    // 清洗请求体中的非法字节（如 NULL 字节 U+0000），
    // 避免后端 PostgreSQL 报 "invalid byte sequence for encoding UTF8: 0x00"。
    // 富文本/Markdown 内容是 NULL 字节的主要来源，故只清洗 data 即可覆盖。
    if (config.data) {
      config.data = sanitizePayload(config.data)
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data

    // 如果 code 不是 200，判断为错误
    if (res.code !== 200) {
      console.error('业务错误:', res.message)

      // 处理特定错误码
      if (res.code === 401) {
        // token 无效或过期，清除本地存储并跳转到登录页
        localStorage.removeItem('quba_token')
        window.location.href = '/'
      }

      // 创建自定义错误对象，保留完整的响应信息
      const error = new Error(res.message || '请求失败')
      error.code = res.code
      error.data = res.data
      return Promise.reject(error)
    }

    return res
  },
  error => {
    // 优先从响应体中获取结构化的错误信息
    if (error.response?.data) {
      const res = error.response.data

      // 处理 401 未授权
      if (error.response.status === 401 || res.code === 401) {
        localStorage.removeItem('quba_token')
        window.location.href = '/'
      }

      // 创建包含后端 message 的错误对象
      const errorObj = new Error(res.message || '请求失败')
      errorObj.code = res.code
      errorObj.data = res.data
      return Promise.reject(errorObj)
    }

    // 网络错误或其他无法获取响应的情况
    return Promise.reject(error)
  }
)

export default request
