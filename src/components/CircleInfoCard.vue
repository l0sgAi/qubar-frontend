<template>
  <div class="circle-info-card">
    <div class="circle-card">
      <!-- 圈子头部信息 -->
      <div class="circle-header-section">
        <div class="circle-avatar-wrapper">
          <router-link :to="`/circle/${circleDetail.id}`" class="avatar-link">
            <img
              v-if="circleDetail.avatar_url"
              :src="circleDetail.avatar_url"
              class="circle-avatar"
              :alt="circleDetail.name"
            />
            <div v-else class="circle-avatar-placeholder">
              {{ circleDetail.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
          </router-link>
          <div class="circle-basic-info">
            <router-link :to="`/circle/${circleDetail.id}`" class="circle-name-link">
              <h3 class="circle-name">{{ circleDetail.name }}</h3>
            </router-link>
            <p class="circle-slug">c/{{ circleDetail.slug || circleDetail.id }}</p>
          </div>
        </div>

        <!-- 加入按钮 -->
        <NButton
          v-if="!circleDetail.is_joined"
          type="primary"
          size="medium"
          round
          @click="handleJoinCircle"
          :loading="joinLoading"
          class="join-button"
        >
          {{ t('circle.joinCircle') }}
        </NButton>
        <NButton
          v-else
          size="medium"
          round
          @click="handleLeaveCircle"
          ghost
          :loading="joinLoading"
          @mouseenter="isButtonHovered = true"
          @mouseleave="isButtonHovered = false"
          :type="isButtonHovered ? 'error' : 'primary'"
          class="join-button"
        >
          {{ isButtonHovered ? t('circle.leaveCircle') : t('circle.joined') }}
        </NButton>
      </div>

      <!-- 统计数据 -->
      <div class="circle-stats">
        <div class="stat-item">
          <NIcon size="18" color="rgba(255,255,255,0.6)">
            <UserIcon />
          </NIcon>
          <div class="stat-content">
            <span class="stat-value">{{ formatNumber(circleDetail.member_count) }}</span>
            <span class="stat-label">{{ t('circle.members') }}</span>
          </div>
        </div>
        <div class="stat-item">
          <NIcon size="18" color="rgba(255,255,255,0.6)">
            <FileTextIcon />
          </NIcon>
          <div class="stat-content">
            <span class="stat-value">{{ formatNumber(circleDetail.post_count) }}</span>
            <span class="stat-label">{{ t('circle.posts') }}</span>
          </div>
        </div>
        <div class="stat-item">
          <NIcon size="18" color="rgba(255,255,255,0.6)">
            <FlameIcon />
          </NIcon>
          <div class="stat-content">
            <span class="stat-value">{{ circleDetail.hot }}</span>
            <span class="stat-label">{{ t('circle.hotness') }}</span>
          </div>
        </div>
      </div>

      <!-- 简介和规则 -->
      <div v-if="circleDetail.description" class="description-section">
        <h4 class="section-title">{{ t('circle.description') }}</h4>
        <p class="description">{{ getDisplayDescription(circleDetail.description) }}</p>
        <div
          v-if="shouldShowMoreButton(circleDetail.description)"
          class="show-more-btn"
          @click="toggleDescription"
        >
          {{ isDescriptionExpanded ? t('common.cancel') : t('common.loadMore') }}
        </div>
      </div>

      <!-- 圈子信息 -->
      <div class="circle-info">
        <div class="info-row">
          <span class="label">{{ t('time.createdAt') }}</span>
          <span class="value">{{ formatDate(circleDetail.create_time) }}</span>
        </div>
        <div class="info-row">
          <span class="label">{{ t('circle.joinType') }}</span>
          <span class="value">{{ getJoinTypeText(circleDetail.join_type) }}</span>
        </div>
      </div>

      <!-- 成员信息 -->
      <div v-if="circleDetail.is_joined" class="member-info">
        <h4 class="section-title">{{ t('circle.memberInfo') }}</h4>
        <div class="info-row">
          <span class="label">{{ t('user.role') }}</span>
          <NTag :type="getRoleInfo(circleDetail.member_role).type" size="small" round>
            {{ getRoleInfo(circleDetail.member_role).text }}
          </NTag>
        </div>
        <div class="info-row">
          <span class="label">{{ t('user.status') }}</span>
          <NTag :type="getMemberStatusInfo(circleDetail.member_status).type" size="small" round>
            {{ getMemberStatusInfo(circleDetail.member_status).text }}
          </NTag>
        </div>
        <div v-if="circleDetail.member_is_top" class="info-row">
          <span class="label">置顶显示</span>
          <span class="value">是</span>
        </div>
        <div v-if="circleDetail.member_is_disturb" class="info-row">
          <span class="label">消息免打扰</span>
          <span class="value">已开启</span>
        </div>
      </div>

      <!-- 圈子规则（放在最后） -->
      <div v-if="circleDetail.rule" class="rules-section">
        <h4 class="section-title">{{ t('circle.rules') }}</h4>
        <p class="rules">{{ circleDetail.rule }}</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon, NTag, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { getCircleDetail, joinCircle, leaveCircle } from '@/api/circle'
import { auth } from '@/utils/auth'
import { requireLogin } from '@/utils/guest-action'
import { User as UserIcon, FileText as FileTextIcon, Flame as FlameIcon } from '@vicons/tabler'

const { t } = useI18n()

const props = defineProps({
  circleId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['join-success', 'leave-success'])

const router = useRouter()
const message = useMessage()

// 圈子详情数据
const circleDetail = ref({
  id: null,
  name: '',
  slug: '',
  avatar_url: '',
  cover_url: '',
  description: '',
  rule: '',
  creator_id: null,
  category_id: null,
  hot: 0,
  member_count: 0,
  post_count: 0,
  join_type: 0,
  status: 0,
  create_time: new Date(),
  update_time: new Date(),
  is_joined: false,
  member_role: 0,
  member_status: 0,
  member_mute_end_time: null,
  member_is_top: 0,
  member_is_disturb: 0
})

const loading = ref(false)
const joinLoading = ref(false)
const isButtonHovered = ref(false)
const isDescriptionExpanded = ref(false)

// 简介折叠展开
const toggleDescription = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value
}

const getDisplayDescription = (description) => {
  if (!description) return ''
  if (isDescriptionExpanded.value) return description
  return description.length > 200 ? description.substring(0, 200) + ' ......' : description
}

const shouldShowMoreButton = (description) => {
  return description && description.length > 200
}

// 格式化数字
const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 格式化日期为国际通用格式：YYYY/MM/DD
const formatDate = (dateStr) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '未知'
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`
}

// 获取加入方式文本
const getJoinTypeText = (type) => {
  const types = {
    0: t('circle.joinTypeDirect'),
    1: t('circle.joinTypeReview'),
    2: t('circle.joinTypePrivate')
  }
  return types[type] || t('common.unknown')
}

// 获取角色文本和类型
const getRoleInfo = (role) => {
  const roles = {
    10: { text: t('circle.roleMember'), type: 'default' },
    20: { text: t('circle.roleAdmin'), type: 'info' },
    30: { text: t('circle.roleOwner'), type: 'warning' }
  }
  return roles[role] || { text: t('common.unknown'), type: 'default' }
}

// 获取状态文本和类型
const getMemberStatusInfo = (status) => {
  const statuses = {
    0: { text: t('user.normal'), type: 'success' },
    1: { text: t('user.normal'), type: 'success' },
    2: { text: t('circle.statusMuted'), type: 'error' }
  }
  return statuses[status] || { text: t('common.unknown'), type: 'default' }
}

// 获取圈子详情
const fetchCircleDetail = async () => {
  if (!props.circleId) return

  loading.value = true
  try {
    const response = await getCircleDetail(props.circleId)
    if (response.data) {
      circleDetail.value = response.data
      // 如果成员状态为4（已退出），则修正 is_joined 为 false
      if (circleDetail.value.member_status === 4) {
        circleDetail.value.is_joined = false
      }
    }
  } catch (error) {
    message.error(t('messages.getDetailFailed', { error: error.message || t('common.unknownError') }))
  } finally {
    loading.value = false
  }
}

// 加入圈子
const handleJoinCircle = async () => {
  // 访客加圈前置拦截：弹登录引导
  if (!auth.isAuthenticated()) {
    requireLogin('join')
    return
  }
  joinLoading.value = true
  try {
    await joinCircle({ circle_id: circleDetail.value.id })
    message.success(t('circle.joinSuccess'))
    circleDetail.value.is_joined = true
    circleDetail.value.member_count += 1
    emit('join-success', circleDetail.value.id)
  } catch (error) {
    message.error(t('circle.joinFailed') + ': ' + (error.message || t('common.unknownError')))
  } finally {
    joinLoading.value = false
  }
}

// 退出圈子
const handleLeaveCircle = async () => {
  // 防御性检查：退出需登录（按钮只在已加入成员处显示）
  if (!auth.isAuthenticated()) {
    requireLogin('join')
    return
  }
  joinLoading.value = true
  isButtonHovered.value = false
  try {
    await leaveCircle({ circle_id: circleDetail.value.id })
    message.success(t('circle.leaveSuccess'))
    circleDetail.value.is_joined = false
    circleDetail.value.member_count -= 1
    emit('leave-success', circleDetail.value.id)
  } catch (error) {
    message.error(t('circle.leaveFailed') + ': ' + (error.message || t('common.unknownError')))
  } finally {
    joinLoading.value = false
  }
}

// 监听 circleId 变化
watch(() => props.circleId, () => {
  fetchCircleDetail()
})

onMounted(() => {
  fetchCircleDetail()
})

// 暴露刷新方法
defineExpose({
  refresh: fetchCircleDetail
})
</script>

<style scoped>
.circle-info-card {
  width: 100%;
  overflow: hidden;
}

.circle-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* 圈子头部信息 */
.circle-header-section {
  padding: 16px;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.circle-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.avatar-link {
  display: block;
  flex-shrink: 0;
  text-decoration: none;
}

.circle-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  object-fit: cover;
  display: block;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.circle-avatar:hover {
  transform: scale(1.05);
  border-color: rgba(102, 234, 194, 0.6);
}

.circle-avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.circle-basic-info {
  flex: 1;
  min-width: 0;
}

.circle-name-link {
  text-decoration: none;
  display: block;
}

.circle-name {
  margin: 0 0 2px 0;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.circle-name-link:hover .circle-name {
  color: rgba(255, 255, 255, 1);
  text-decoration: underline;
}

.circle-slug {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.join-button {
  flex-shrink: 0;
}

/* 统计数据 */
.circle-stats {
  display: flex;
  padding: 3dvh;
  padding-left: 4dvw;
  border-bottom: 1px solid var(--glass-border);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  /* flex: 1; */
  min-width: 0;
}

.stat-value {
  margin-left: 5px;
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.stat-label {
  /* margin-left: 5px; */
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

/* 描述和规则 */
.description-section,
.rules-section {
  padding: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.show-more-btn {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #66eac2;
  cursor: pointer;
  transition: color 0.2s ease;
  user-select: none;
}

.show-more-btn:hover {
  color: #8af0d0;
}

.rules-section {
  border-top: 1px solid var(--glass-border);
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.description,
.rules {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  font-size: 0.85rem;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  margin: 0;
}

.rules {
  color: rgba(255, 255, 255, 0.6);
}

/* 圈子信息和成员信息 */
.circle-info,
.member-info {
  padding: 16px;
}

.member-info {
  border-top: 1px solid var(--glass-border);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.info-row .value {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
  font-weight: 500;
  text-align: right;
}

/* 响应式 */
@media (max-width: 768px) {
  .circle-header-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .join-button {
    width: 100%;
  }

  .circle-stats {
    gap: 8px;
  }
}
</style>
