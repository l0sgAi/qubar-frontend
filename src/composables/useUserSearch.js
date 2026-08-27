// 用户搜索组合式函数：MentionPicker（按钮版）与 MentionTrigger（编辑器内联版）共用。
// 内置单调序号丢弃过期响应、关键词变更即作废旧结果；
// 空 keyword 立即查询（弹层刚打开时的默认列表），有关键词才防抖。
import { ref } from 'vue'
import { searchUsers } from '@/api/user'
import { useDebounceFn } from '@/utils/throttle'

export function useUserSearch({ size = 10, delay = 300 } = {}) {
  const keyword = ref('')
  const users = ref([])
  const loading = ref(false)
  let searchSeq = 0

  const doSearch = async (kw) => {
    const seq = searchSeq
    loading.value = true
    try {
      const res = await searchUsers({ keyword: kw, size })
      users.value = res.data?.data || []
    } catch (error) {
      if (seq !== searchSeq) return
      console.error('搜索用户失败:', error)
      users.value = []
    } finally {
      if (seq === searchSeq) loading.value = false
    }
  }

  const debouncedSearch = useDebounceFn(doSearch, delay)

  // 关键词变化：作废旧结果 + 调度查询；空关键词立即查询（默认推荐列表）
  const search = (kw) => {
    keyword.value = kw
    searchSeq += 1
    users.value = []
    if (!kw) {
      doSearch(kw)
    } else {
      // 防抖等待期先置 loading，弹窗显示转圈而非残页
      loading.value = true
      debouncedSearch(kw)
    }
  }

  // 请求序号作废：迟到的旧响应直接丢弃
  const invalidate = () => {
    searchSeq += 1
    users.value = []
    loading.value = false
    keyword.value = ''
  }

  return { keyword, users, loading, search, invalidate }
}
