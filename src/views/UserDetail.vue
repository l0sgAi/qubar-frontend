<template>
  <NConfigProvider :theme="darkTheme" :theme-overrides="themeOverrides">
    <div class="user-detail-page">
      <!-- 顶栏 -->
      <AppHeader />

      <!-- 侧边栏 -->
      <SideNav @collapsed="offset = 64" @expanded="offset = 260" />

      <!-- 主内容区域 -->
      <div class="main-content" :style="{ 'margin-left': `${offset}px`, width: `calc(100% - ${offset}px)` }">
        <!-- 左侧内容区域 -->
        <div class="content-area">
          <!-- 标签页内容 -->
          <NCard class="tabs-card" :bordered="false">
          <NTabs
            v-model:value="activeTab"
            type="line"
            animated
            size="large"
            class="profile-tabs">

            <!-- 帖子 Tab -->
            <NTabPane name="posts" display-directive="show">
              <template #tab>
                <NSpace align="center" :size="6">
                  <span>帖子</span>
                  <NTag size="small" :bordered="false" round>{{ postsTotal }}</NTag>
                </NSpace>
              </template>
              <MyPosts
                :user-id="String(route.params.id || '')"
                :active="activeTab === 'posts'"
                readonly
                @total-change="handlePostsTotalChange"/>
            </NTabPane>

            <!-- 加入的兴趣圈 Tab（机器人不显示） -->
            <NTabPane v-if="!isBot" name="groups" display-directive="show">
              <template #tab>
                <NSpace align="center" :size="6">
                  <span>兴趣圈</span>
                  <NTag size="small" :bordered="false" round>{{ groupsTotal }}</NTag>
                </NSpace>
              </template>
              <MyGroups
                :user-id="String(route.params.id || '')"
                :active="activeTab === 'groups'"
                @total-change="handleGroupsTotalChange"
                @click="handleGroupClick"/>
            </NTabPane>
          </NTabs>
        </NCard>
        </div>

        <!-- 右侧用户信息栏 -->
        <div class="sidebar-area">
          <NCard class="profile-sidebar-card" :bordered="false">
            <!-- 用户头像和名称 -->
            <div class="sidebar-header">
              <NAvatar
                :size="260"
                :src="userInfo.avatar_url"
                round
                class="sidebar-avatar">
                 <div class="avatar-font" 
                 v-if="!userInfo.avatar_url || userInfo.avatar_url == ''">
                 {{ userInfo.username.charAt(0) }}
                </div>
            </NAvatar>
              <h2 class="sidebar-username">{{ userInfo.username || '未设置' }}</h2>
            </div>

            <!-- 用户基本信息 -->
            <div class="sidebar-section">
              <!-- <NText depth="3" style="font-size: 12px; margin-bottom: 8px; display: block;">基本信息</NText> -->
              <!-- 机器人：只显示角色和状态 -->
              <div v-if="isBot" class="info-list">
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">角色</NText>
                  <NTag :type="getRoleType(userInfo.role)" size="small" round>
                    {{ getRoleText(userInfo.role) }}
                  </NTag>
                </div>
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">状态</NText>
                  <NTag :type="userInfo.status === 1 ? 'success' : 'error'" size="small" round>
                    {{ userInfo.status === 1 ? '正常' : '禁用' }}
                  </NTag>
                </div>
              </div>
              <!-- 普通用户：完整信息 -->
              <div v-else class="info-list">
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">邮箱</NText>
                  <NText style="font-size: 15px;">{{ userInfo.email || '未设置' }}</NText>
                </div>
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">手机号</NText>
                  <NText style="font-size: 15px;">{{ userInfo.phone || '未绑定' }}</NText>
                </div>
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">性别</NText>
                  <NTag :type="getGenderType(userInfo.gender)" size="small" round>
                    {{ getGenderText(userInfo.gender) }}
                  </NTag>
                </div>
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">生日</NText>
                  <NText style="font-size: 15px;">{{ formatDate(userInfo.birthdate) }}</NText>
                </div>
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">角色</NText>
                  <NTag :type="getRoleType(userInfo.role)" size="small" round>
                    {{ getRoleText(userInfo.role) }}
                  </NTag>
                </div>
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">状态</NText>
                  <NTag :type="userInfo.status === 1 ? 'success' : 'error'" size="small" round>
                    {{ userInfo.status === 1 ? '正常' : '禁用' }}
                  </NTag>
                </div>
              </div>
            </div>
          </NCard>
        </div>
      </div>
    </div>
  </NConfigProvider>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NConfigProvider,
  NCard,
  NAvatar,
  NIcon,
  NTabs,
  NTabPane,
  NSpace,
  NTag,
  NText,
  darkTheme,
  useMessage
} from 'naive-ui'
import AppHeader from '@/components/AppHeader.vue'
import SideNav from '@/components/SideNav.vue'
import MyPosts from '@/components/user-profile/MyPosts.vue'
import MyGroups from '@/components/user-profile/MyGroups.vue'
import { getUserDetail } from '@/api/user'

const router = useRouter()
const offset = ref(260)
const route = useRoute()
const message = useMessage()

// 当前激活的标签页
const activeTab = ref('posts')

// 是否机器人（role=2）
const isBot = computed(() => userInfo.value.role === 2)

// 用户信息
const userInfo = ref({
  id: null,
  username: '',
  email: '',
  phone: '',
  google_id: '',
  x_id: '',
  github_id: '',
  avatar_url: '',
  gender: 0,
  birthdate: null,
  status: 1,
  role: 0,
  create_time: null,
  update_time: null
})

// 帖子总数（由 MyPosts 通过 total-change 上报，用于 Tab 计数）
const postsTotal = ref(0)
const handlePostsTotalChange = (total) => {
  postsTotal.value = total || 0
}

// 加入的兴趣圈总数（由 MyGroups 通过 total-change 上报，用于 Tab 计数）
const groupsTotal = ref(0)
const handleGroupsTotalChange = (total) => {
  groupsTotal.value = total || 0
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const userId = route.params.id
    if (!userId) {
      message.error('用户ID不存在')
      router.push('/home')
      return
    }

    const response = await getUserDetail(userId)
    if (response.data) {
      userInfo.value = response.data
    } else {
      message.error('获取用户信息失败')
      router.push('/home')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    message.error('获取用户信息失败')
    router.push('/home')
  }
}

// 兴趣圈操作
const handleGroupClick = (group) => {
  router.push(`/circle/${group.id}`)
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未设置'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 获取性别文本
const getGenderText = (gender) => {
  const genderMap = {
    0: '未设置',
    1: '男',
    2: '女',
    3: '其他'
  }
  return genderMap[gender] || '未设置'
}

// 获取性别标签类型
const getGenderType = (gender) => {
  const typeMap = {
    0: 'default',
    1: 'info',
    2: 'error',
    3: 'warning'
  }
  return typeMap[gender] || 'default'
}

// 获取角色文本
const getRoleText = (role) => {
  const roleMap = {
    0: '普通用户',
    1: '管理员',
    2: '机器人'
  }
  return roleMap[role] || '普通用户'
}

// 获取角色标签类型
const getRoleType = (role) => {
  const typeMap = {
    0: 'default',
    1: 'warning',
    2: 'info'
  }
  return typeMap[role] || 'default'
}

onMounted(() => {
  // 用户公开主页访客可读：/user/detail/:id 已开放 anonymous
  fetchUserInfo()
})
</script>

<style scoped>
.user-detail-page {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
}
.main-content {
  margin-top: var(--header-height);
  padding: 24px;
  min-height: calc(100vh - var(--header-height));
  transition: margin-left 0.3s ease, width 0.3s ease;
  display: flex;
  gap: 24px;
  justify-content: center;
}

/* 左侧内容区域 */
.content-area {
  flex: 1;
  min-width: 25dvw;
  max-width: 55dvw;
}

/* 右侧边栏区域 */
.sidebar-area {
  width: 20dvw;
  flex-shrink: 0;
}

/* 右侧栏卡片 - 无边框设计 */
.profile-sidebar-card {
  position: sticky;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 侧边栏头部 */
.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 24px;
}

.sidebar-avatar {
  border: 4px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin-bottom: 16px;
}

.sidebar-username {
  font-size: 1.75rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  background: rgba(78, 233, 158, 0.896);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
}

/* 侧边栏区块 */
.sidebar-section {
  margin-bottom: 20px;
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-row {
  display: flex;
  /* padding: 10px 14px; */
  /* background: rgba(255, 255, 255, 0.02); */
  border-radius: 10px;
  transition: background 0.2s;
}

/* .info-row:hover {
  background: rgba(255, 255, 255, 0.04);
} */

/* 绑定列表 */
.binding-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.binding-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  transition: all 0.2s;
}

.binding-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.binding-row.bound {
  background: rgba(66, 184, 131, 0.05);
}

.binding-row.bound:hover {
  background: rgba(66, 184, 131, 0.08);
}

.binding-left {
  display: flex;
  align-items: center;
}

/* 标签页卡片 */
.tabs-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(20px);
}

.profile-tabs {
  padding: 0 8px;
}

.avatar-font{
  font-size: 10dvw;
  /* margin-bottom: 3dvh; */
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}

.profile-tabs :deep(.n-tab-pane) {
  padding: 24px 0 0 0;
}

/* 响应式 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }

  .sidebar-area {
    width: 100%;
    order: -1;
  }

  .profile-sidebar-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 16px;
  }
}
</style>
