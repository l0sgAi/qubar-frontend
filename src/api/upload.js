import request from '@/utils/request'

/**
 * 上传图片
 * @param {File} file - 图片文件
 * @param {object} [options]
 * @param {(e: ProgressEvent) => void} [options.onUploadProgress] - axios 上传进度回调，用于展示真实上传进度
 * @returns {Promise} 返回包含 URL 的响应
 */
export function uploadImage(file, { onUploadProgress } = {}) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/upload/image',
    method: 'post',
    data: formData,
    onUploadProgress
    // 不手动设 Content-Type：axios 检测到 FormData 会自动加上
    // 'multipart/form-data; boundary=...'，手动设会丢 boundary 导致后端解析为空。
  })
}
