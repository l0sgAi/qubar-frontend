<template>
  <div class="admin-agents-page">
    <!-- 顶栏 -->
    <AppHeader />

    <!-- 侧边栏 -->
    <SideNav @collapsed="offset = 64" @expanded="offset = 260" />

    <!-- 主内容区域 -->
    <div class="content-wrapper" :style="{ 'margin-left': `${offset}px`, width: `calc(100% - ${offset}px)` }">
      <div class="main-content">
        <div class="agents-container">
          <!-- 页头 -->
          <div class="agents-header">
            <div class="header-left">
              <h1 class="page-title">{{ t('agent.title') }}</h1>
            </div>
            <div class="header-actions">
              <NInput
                v-model:value="keyword"
                size="small"
                clearable
                :placeholder="t('agent.searchPlaceholder')"
                class="search-input"
              >
                <template #prefix>
                  <NIcon size="14"><SearchIcon /></NIcon>
                </template>
              </NInput>
              <NButton type="primary" size="small" @click="openCreate">
                {{ t('agent.create') }}
              </NButton>
            </div>
          </div>

          <!-- 非管理员：入口被隐藏但直达 URL 时兜底提示 -->
          <div v-if="!checkingRole && !isAdmin" class="forbidden">
            <NIcon size="48" :color="'rgba(255,255,255,0.25)'"><ShieldIcon /></NIcon>
            <p>{{ t('agent.noPermission') }}</p>
          </div>

          <!-- 机器人表格 -->
          <NDataTable
            v-else
            :columns="columns"
            :data="filteredAgents"
            :loading="loading || checkingRole"
            :row-key="row => row.id"
            :bordered="false"
            size="small"
            class="agents-table"
          />

          <!-- 分页 -->
          <div v-if="total > pageSize" class="pagination-row">
            <NPagination
              v-model:page="page"
              :page-size="pageSize"
              :item-count="total"
              @update:page="fetchAgents"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑弹窗 -->
    <AgentFormModal
      v-model:show="showFormModal"
      :agent="editingAgent"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue'
import {
  NDataTable, NButton, NInput, NIcon, NAvatar, NTag, NSwitch,
  NPagination, NPopconfirm, NText, useMessage
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { Search as SearchIcon, Shield as ShieldIcon } from '@vicons/tabler'
import AppHeader from '@/components/AppHeader.vue'
import SideNav from '@/components/SideNav.vue'
import AgentFormModal from '@/components/AgentFormModal.vue'
import { getAgentList, updateAgent, deleteAgent } from '@/api/agent'
import { getUserInfo } from '@/api/auth'

const { t } = useI18n()
const message = useMessage()
const offset = ref(260)

// ---- 权限自查：后端约定管理员为 role=1，非管理员接口一律 403 ----
const isAdmin = ref(false)
const checkingRole = ref(true)

onMounted(async () => {
  try {
    const res = await getUserInfo()
    isAdmin.value = res.data?.role === 1
  } catch (e) {
    console.error('获取用户信息失败:', e)
    isAdmin.value = false
  } finally {
    checkingRole.value = false
  }
  if (isAdmin.value) fetchAgents()
})

// ---- 列表（服务端分页，create_time 倒序） ----
const agents = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = 20
const total = ref(0)

const fetchAgents = async () => {
  loading.value = true
  try {
    const res = await getAgentList({ page: page.value, size: pageSize })
    agents.value = res.data || []
    total.value = res.total || 0
  } catch (e) {
    console.error('获取机器人列表失败:', e)
    message.error(e.message || t('common.operationFailed'))
    agents.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 接口无筛选参数，本地按名称/模型过滤当前页数据即可（数据量小）
const keyword = ref('')
const filteredAgents = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return agents.value
  return agents.value.filter(
    a => a.name?.toLowerCase().includes(kw) || a.model?.toLowerCase().includes(kw)
  )
})

// ---- 触发模式文案 ----
const triggerModeText = mode =>
  ({ 1: t('agent.triggerModes.all'), 2: t('agent.triggerModes.keyword'), 3: t('agent.triggerModes.manual') })[mode] || t('common.unknown')

const formatTime = ts => {
  if (!ts) return ''
  try {
    // RFC3339 带时区，直接解析
    return new Date(ts).toLocaleString()
  } catch {
    return ts
  }
}

// ---- 状态开关：PUT { status } 部分更新 ----
const toggleStatus = async (row, value) => {
  try {
    const res = await updateAgent(row.id, { status: value ? 1 : 0 })
    const idx = agents.value.findIndex(a => a.id === row.id)
    if (idx !== -1) agents.value[idx] = res.data || { ...agents.value[idx], status: value ? 1 : 0 }
  } catch (e) {
    message.error(e.message || t('agent.statusUpdateFailed'))
    fetchAgents()
  }
}

// ---- 删除：软删不可恢复，二次确认 ----
const handleDelete = async row => {
  try {
    await deleteAgent(row.id)
    message.success(t('agent.deleteSuccess'))
    // 当前页删空后回退一页
    if (agents.value.length === 1 && page.value > 1) page.value -= 1
    fetchAgents()
  } catch (e) {
    message.error(e.message || t('common.operationFailed'))
  }
}

// ---- 表格列 ----
const columns = computed(() => [
  {
    title: t('agent.table.name'),
    key: 'name',
    render: row => h('div', { class: 'agent-name-cell' }, [
      h(NAvatar, {
        src: row.avatar_url || undefined,
        size: 28,
        round: true,
        style: { flexShrink: 0 }
      }, { default: () => (row.name || '?').charAt(0) }),
      h('div', { class: 'agent-name-text' }, [
        h('span', { class: 'agent-name' }, row.name),
        h(NText, { depth: 3, style: 'font-size: 12px' }, { default: () => row.model })
      ])
    ])
  },
  {
    title: t('agent.table.protocol'),
    key: 'api_protocol',
    width: 110,
    render: row => h(NTag, { size: 'small', bordered: false }, { default: () => row.api_protocol })
  },
  {
    title: t('agent.table.trigger'),
    key: 'trigger',
    width: 200,
    render: row => h('div', { class: 'trigger-cell' }, [
      h('span', { class: 'trigger-mode' }, triggerModeText(row.trigger_mode)),
      ...(row.trigger_mode === 2 && row.trigger_keywords?.length
        ? [h('div', { class: 'keyword-tags' },
            row.trigger_keywords.slice(0, 3).map(kw =>
              h(NTag, { size: 'tiny', bordered: false, type: 'info', key: kw }, { default: () => kw })
            ),
            row.trigger_keywords.length > 3
              ? h(NText, { depth: 3, style: 'font-size: 11px' }, { default: () => `+${row.trigger_keywords.length - 3}` })
              : null
          )]
        : [])
    ])
  },
  {
    title: t('agent.table.rateLimit'),
    key: 'rate',
    width: 150,
    render: row => h('span', { class: 'rate-text' }, [
      `${row.max_replies_per_hour === 0 ? t('agent.unlimited') : row.max_replies_per_hour}/${t('agent.form.perHour')}`,
      ' · ',
      `${row.min_interval_sec === 0 ? t('agent.unlimited') : row.min_interval_sec}${t('agent.form.seconds')}`
    ])
  },
  {
    title: t('agent.table.status'),
    key: 'status',
    width: 90,
    render: row => h(NSwitch, {
      value: row.status === 1,
      size: 'small',
      'onUpdate:value': v => toggleStatus(row, v)
    })
  },
  {
    title: t('agent.table.createTime'),
    key: 'create_time',
    width: 170,
    render: row => h(NText, { depth: 3, style: 'font-size: 12px' }, { default: () => formatTime(row.create_time) })
  },
  {
    title: t('agent.table.actions'),
    key: 'actions',
    width: 130,
    render: row => h('div', { class: 'action-cell' }, [
      h(NButton, { size: 'tiny', quaternary: true, onClick: () => openEdit(row) }, { default: () => t('common.edit') }),
      h(NPopconfirm, {
        onPositiveClick: () => handleDelete(row)
      }, {
        trigger: () => h(NButton, { size: 'tiny', quaternary: true, type: 'error' }, { default: () => t('common.delete') }),
        default: () => t('agent.deleteConfirm', { name: row.name })
      })
    ])
  }
])

// ---- 创建/编辑弹窗 ----
const showFormModal = ref(false)
const editingAgent = ref(null)

const openCreate = () => {
  editingAgent.value = null
  showFormModal.value = true
}

const openEdit = row => {
  editingAgent.value = row
  showFormModal.value = true
}

const handleFormSuccess = vo => {
  if (editingAgent.value) {
    // 编辑成功：用返回的完整 AgentVO 局部替换
    const idx = agents.value.findIndex(a => a.id === vo.id)
    if (idx !== -1) agents.value[idx] = vo
  } else {
    // 创建成功：回到第一页展示（列表按 create_time 倒序，新机器人置顶）
    page.value = 1
    fetchAgents()
  }
}
</script>

<style scoped>
.admin-agents-page {
  min-height: 100vh;
}

.content-wrapper {
  display: flex;
  padding-top: var(--header-height);
}

.main-content {
  flex: 1;
  min-width: 0;
  padding: 24px;
}

.agents-container {
  max-width: 1100px;
  margin: 0 auto;
}

.agents-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 220px;
}

.forbidden {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
  color: rgba(255, 255, 255, 0.5);
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 表格单元格 */
.agent-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.agent-name-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.agent-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trigger-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trigger-mode {
  font-size: 12px;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.rate-text {
  font-size: 12px;
  white-space: nowrap;
}

.action-cell {
  display: flex;
  gap: 4px;
}
</style>
