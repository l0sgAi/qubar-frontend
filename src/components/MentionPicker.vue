<template>
  <NPopover
    v-model:show="show"
    trigger="click"
    placement="top-start"
    @update:show="handleShowChange"
  >
    <template #trigger>
      <NButton quaternary size="small" :title="t('notice.mention.button')">
        <template #icon>
          <NIcon :size="iconSize">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"></path>
            </svg>
          </NIcon>
        </template>
      </NButton>
    </template>

    <div class="mention-picker">
      <NInput
        v-model:value="keyword"
        size="small"
        round
        clearable
        :placeholder="t('notice.mention.searchPlaceholder')"
        @update:value="handleSearch"
      />
      <div class="mention-results">
        <div v-if="loading" class="mention-tip">
          <NSpin size="tiny" />
        </div>
        <template v-else>
          <div
            v-for="user in users"
            :key="user.id"
            class="mention-user"
            :class="{ selected: selectedIds.includes(user.id) }"
            @click="handleSelect(user)"
          >
            <NAvatar round :size="24" :src="user.avatar_url || undefined">
              {{ (user.username || '?').charAt(0).toUpperCase() }}
            </NAvatar>
            <span class="mention-user-name">{{ user.username }}</span>
          </div>
          <div v-if="!users.length" class="mention-tip">{{ t('notice.mention.empty') }}</div>
        </template>
      </div>
      <div class="mention-limit">{{ t('notice.mention.limitTip') }}</div>
    </div>
  </NPopover>
</template>

<script setup>
import { ref } from 'vue'
import { NPopover, NButton, NIcon, NInput, NAvatar, NSpin } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useUserSearch } from '@/composables/useUserSearch'

// 已选用户 id 列表由父组件维护；选人上限 10 人也在父组件拦截（后端实际生效 10 人）
const props = defineProps({
  selectedIds: {
    type: Array,
    default: () => []
  },
  iconSize: {
    type: Number,
    default: 18
  }
})

const emit = defineEmits(['select'])

const { t } = useI18n()

const show = ref(false)
const { keyword, users, loading, search: runSearch, invalidate } = useUserSearch({ size: 10, delay: 300 })

const handleSearch = (kw) => {
  runSearch(kw)
}

const handleSelect = (user) => {
  // 重复选同一人无意义，直接忽略；超限由父组件 useMentions 统一拦截
  if (props.selectedIds.includes(user.id)) return
  emit('select', user)
  show.value = false
  invalidate()
}

// 打开弹层时带一次初始列表（空关键词）
const handleShowChange = (val) => {
  if (val && !users.value.length && !keyword.value) {
    runSearch('')
  }
}
</script>

<!-- NPopover 面板传送到 <body>，其内容样式不在此处 scoped 内，
     已写入全局 main.css（.mention-picker 系列） -->

