// 分享 / 复制链接（移动端门户用，见 docs/mobile-adaptation-plan.md 2.2 / 6.3）

/**
 * 复制文本到剪贴板。优先异步 Clipboard API（需安全上下文），失败回落 execCommand。
 * @returns {Promise<boolean>} 是否复制成功
 */
export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // 权限被拒 / 非安全上下文：走降级
  }
  let el = null
  try {
    el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    el?.remove()
  }
}

/**
 * 调起系统分享面板；不支持时复制链接。
 * @returns {Promise<'shared'|'cancelled'|'copied'|'failed'>}
 */
export async function shareOrCopy({ title, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url })
      return 'shared'
    } catch (err) {
      // 用户关闭分享面板：不再回落复制，避免打扰
      if (err?.name === 'AbortError') return 'cancelled'
    }
  }
  return (await copyText(url)) ? 'copied' : 'failed'
}
