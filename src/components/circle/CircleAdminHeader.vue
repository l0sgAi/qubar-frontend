<template>
  <div class="admin-header">
    <div class="admin-top">
      <NButton text size="small" @click="goDetail">
        <template #icon>
          <NIcon><ArrowLeftIcon /></NIcon>
        </template>
        {{ t('circle.manage.backToCircle') }}
      </NButton>
    </div>

    <div class="admin-brief">
      <NAvatar round :size="48" :src="circle.avatar_url || undefined">
        <div v-if="!circle.avatar_url">{{ (circle.name || '').charAt(0).toUpperCase() }}</div>
      </NAvatar>

      <div class="brief-info">
        <h2 class="brief-name">{{ circle.name }}</h2>
        <NTag size="small" round :type="getRoleInfo(myRole).type">
          {{ getRoleInfo(myRole).text }}
        </NTag>
      </div>

      <!-- 管理区切换：成员管理 / 编辑资料 / 内容审核 -->
      <div class="seg-nav">
        <button
          class="seg-item"
          :class="{ active: active === 'members' }"
          type="button"
          @click="go('members')"
        >
          <NIcon size="16"><UsersIcon /></NIcon>
          <span>{{ t('circle.manage.title') }}</span>
          <span v-if="pendingBadgeCount > 0" class="seg-badge">
            {{ pendingBadgeFull ? t('circle.manage.badgeFull') : pendingBadgeCount }}
          </span>
        </button>
        <button
          class="seg-item"
          :class="{ active: active === 'edit' }"
          type="button"
          @click="go('edit')"
        >
          <NIcon size="16"><SettingsIcon /></NIcon>
          <span>{{ t('circle.edit.title') }}</span>
        </button>
        <button
          class="seg-item"
          :class="{ active: active === 'moderation' }"
          type="button"
          @click="go('moderation')"
        >
          <NIcon size="16"><ShieldCheckIcon /></NIcon>
          <span>{{ t('circle.moderation.title') }}</span>
          <span v-if="moderationBadgeCount > 0" class="seg-badge">
            {{ moderationBadgeFull ? t('circle.manage.badgeFull') : moderationBadgeCount }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NAvatar, NButton, NIcon, NTag } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import {
  ArrowLeft as ArrowLeftIcon,
  Users as UsersIcon,
  Settings as SettingsIcon,
  ShieldCheck as ShieldCheckIcon
} from '@vicons/tabler'
import { getCircleMembers } from '@/api/circle'
import { getModerationPosts } from '@/api/moderation'
import { useCircleMeta } from '@/composables/useCircleMeta'
import { MEMBER_PAGE_SIZE, isManager } from '@/constants/circle'
import { MODERATION_PAGE_SIZE } from '@/constants/moderation'

const props = defineProps({
  // 圈子详情对象（含 member_role / name / avatar_url）
  circle: {
    type: Object,
    default: () => ({})
  },
  // 当前激活的管理页：'members' | 'edit' | 'moderation'
  active: {
    type: String,
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { getRoleInfo } = useCircleMeta()

const myRole = computed(() => props.circle.member_role || 0)

const goDetail = () => router.push(`/circle/${route.params.id}`)
// seg key 与管理页子路径一一对应：/circle/:id/<key>
const go = (key) => {
  if (key === props.active) return
  router.push(`/circle/${route.params.id}/${key}`)
}

// 待审核角标：拉一页 status=0&size=20，满页显示「20+」，否则按实际条数。
// 角标归属页头组件，成员管理页操作后可通过 ref 调 refreshPendingBadge 同步。
const pendingBadgeCount = ref(0)
const pendingBadgeFull = ref(false)

const refreshPendingBadge = async () => {
  if (!isManager(myRole.value)) return
  try {
    const res = await getCircleMembers({
      circle_id: route.params.id,
      status: '0',
      size: MEMBER_PAGE_SIZE
    })
    pendingBadgeCount.value = res.data?.members?.length || 0
    pendingBadgeFull.value = pendingBadgeCount.value >= MEMBER_PAGE_SIZE
  } catch {
    pendingBadgeCount.value = 0
    pendingBadgeFull.value = false
  }
}

// 内容审核角标：同上，拉一页待审帖子 size=20，满页显示「20+」；审核页处理后经 ref 调 refreshModerationBadge 同步
const moderationBadgeCount = ref(0)
const moderationBadgeFull = ref(false)

const refreshModerationBadge = async () => {
  if (!isManager(myRole.value)) return
  try {
    const res = await getModerationPosts({
      circle_id: route.params.id,
      size: MODERATION_PAGE_SIZE
    })
    moderationBadgeCount.value = res.data?.posts?.length || 0
    moderationBadgeFull.value = moderationBadgeCount.value >= MODERATION_PAGE_SIZE
  } catch {
    moderationBadgeCount.value = 0
    moderationBadgeFull.value = false
  }
}

onMounted(() => {
  refreshPendingBadge()
  refreshModerationBadge()
})

defineExpose({ refreshPendingBadge, refreshModerationBadge })
</script>

<style scoped>
.admin-header {
  max-width: 900px;
  margin: 0 auto;
}

.admin-top {
  margin-bottom: 12px;
}

.admin-brief {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.brief-info {
  flex: 1;
  min-width: 0;
}

.brief-name {
  margin: 0 0 6px 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary, #fff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 管理区切换：胶囊分段，激活态用主题绿 */
.seg-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  flex-shrink: 0;
}

.seg-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.seg-item:hover {
  background: rgba(102, 234, 194, 0.14);
  color: #8af0d0;
}

.seg-item.active {
  background: rgba(102, 234, 194, 0.18);
  color: #8af0d0;
  font-weight: 600;
}

.seg-badge {
  min-width: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: rgba(255, 90, 90, 0.9);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
}

@media (max-width: 640px) {
  .admin-brief {
    flex-wrap: wrap;
  }

  .seg-nav {
    width: 100%;
    justify-content: stretch;
  }

  .seg-item {
    flex: 1;
    justify-content: center;
  }
}
</style>
