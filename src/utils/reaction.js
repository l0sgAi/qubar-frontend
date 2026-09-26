/**
 * 点赞 / 收藏状态同步（乐观更新 + 按目标 debounce + 显式 action 幂等请求）
 *
 * 后端 /like/toggle、/collect/toggle 支持 action（like|unlike、collect|uncollect）：
 * 「设成某状态」语义，重复请求结果相同、计数只变一次，因此：
 * - 每次请求都带 action（由 UI 期望状态推出），超时/断网可安全重试一次；
 * - 失败（400/500/503 等）时服务端状态 = 点击前状态，回滚到点击前快照；
 * - 成功时以响应中的 is_liked / is_collected 为准校正 UI。
 */

// 仅对未拿到响应的请求（超时 / 断网）重试：带 action 的请求幂等，重发安全
const isTransientError = (error) => !!error?.isAxiosError && !error.response

async function sendWithRetry(send, desired) {
  try {
    return await send(desired)
  } catch (error) {
    if (isTransientError(error)) return send(desired)
    throw error
  }
}

/**
 * 创建一个按 key 独立 debounce 的切换器。
 * @param {number} delay - debounce 间隔(ms)，合并连击，只发最终期望状态
 * @returns {(key: string, opts: {
 *   get: () => boolean,
 *   set: (value: boolean) => void,
 *   send: (desired: boolean) => Promise<boolean>,
 *   onError?: (error: Error) => void
 * }) => void}
 *   get/set 读写 UI 状态（set 内自行处理计数 ±1）；
 *   send 发请求并返回服务端最终状态。
 */
export function createReactionSync(delay = 600) {
  // key → { timer, confirmed, seq, appliedSeq, inflight }
  const entries = new Map()

  const release = (key, entry) => {
    if (!entry.timer && entry.inflight === 0) entries.delete(key)
  }

  return function toggle(key, { get, set, send, onError }) {
    let entry = entries.get(key)
    if (!entry) {
      // confirmed：服务端已确认状态，首次点击前的快照
      entry = { timer: null, confirmed: get(), seq: 0, appliedSeq: 0, inflight: 0 }
      entries.set(key, entry)
    }

    set(!get()) // 乐观更新

    clearTimeout(entry.timer)
    entry.timer = setTimeout(async () => {
      entry.timer = null
      const desired = get()
      // 连击后回到原状态：无需请求
      if (desired === entry.confirmed && entry.inflight === 0) {
        release(key, entry)
        return
      }

      const seq = ++entry.seq
      entry.inflight++
      try {
        const serverState = await sendWithRetry(send, desired)
        if (seq > entry.appliedSeq) {
          entry.appliedSeq = seq
          entry.confirmed = serverState
        }
        // 仅最新请求且期间无新点击时，以服务端为准校正 UI
        if (seq === entry.seq && !entry.timer && get() !== serverState) {
          set(serverState)
        }
      } catch (error) {
        // 服务端未变更：回滚到点击前状态（期间有新点击则交给后续请求处理）
        if (seq === entry.seq && !entry.timer) set(entry.confirmed)
        onError?.(error)
      } finally {
        entry.inflight--
        release(key, entry)
      }
    }, delay)
  }
}

/**
 * 点赞/收藏失败提示文案。
 * 404(code 204)：内容已删除；503(code 212)/5xx/超时断网：服务繁忙请重试；其他：通用失败。
 * 401 由 request 拦截器统一处理。
 */
export function reactionErrorMessage(error, t) {
  if (error?.status === 404 || error?.code === 204) {
    return t('messages.contentRemoved')
  }
  if (
    error?.status >= 500 ||
    error?.code === 212 ||
    error?.code === 210 ||
    isTransientError(error)
  ) {
    return t('messages.actionBusy')
  }
  return t('messages.operationFailed', { error: error?.message })
}
