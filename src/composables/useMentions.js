// @提及 已选用户状态：MentionPicker（按钮版）与 MentionTrigger（编辑器内联版）共用一份
// mentionedUsers；提交时由 filterMentionedIds(content, mentionedUsers) 过滤出仍存在于正文的
// uuid 传给后端。去重 + 10 人上限在此统一拦截，两处入口共享同一计数。
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'
import { MAX_MENTIONS, seedUsers } from '@/utils/mentionResolve'

export function useMentions({ getText, setText }) {
  const { t } = useI18n()
  const message = useMessage()
  const mentionedUsers = ref([])
  const selectedIds = computed(() => mentionedUsers.value.map(u => u.id))

  // 是否可选：未重复且未达上限（供 UI 置灰判断）
  const canSelect = user =>
    !!user?.id && !selectedIds.value.includes(user.id) && mentionedUsers.value.length < MAX_MENTIONS

  // 记录选择：重复忽略；超限警告并拒绝（后端也会静默截断到 10 人，此处提前拦截）
  const recordSelection = (user) => {
    if (!user?.id) return false
    if (selectedIds.value.includes(user.id)) return false
    if (mentionedUsers.value.length >= MAX_MENTIONS) {
      message.warning(t('notice.mention.limitTip'))
      return false
    }
    mentionedUsers.value.push(user)
    seedUsers([user])
    return true
  }

  // 按钮版选人：追加到正文末尾（原有交互，保持不变）
  const appendAtEnd = (user) => {
    if (!recordSelection(user)) return
    setText(`${getText()}@${user.username} `)
  }

  // 提交成功/取消后清空（正文重置时同步调用）
  const clearMentioned = () => {
    mentionedUsers.value = []
  }

  return { mentionedUsers, selectedIds, canSelect, recordSelection, appendAtEnd, clearMentioned }
}
