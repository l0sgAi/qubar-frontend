<template>
  <NConfigProvider :theme="darkTheme" :theme-overrides="themeOverrides">
    <div class="user-profile-page">
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

            <!-- 我的帖子 Tab -->
            <NTabPane name="posts">
              <template #tab>
                <NSpace align="center" :size="6">
                  <span>{{ t('user.myPosts') }}</span>
                  <NTag size="small" :bordered="false" round>{{ mockData.posts.length }}</NTag>
                </NSpace>
              </template>
              <MyPosts
                :posts="mockData.posts"
                @edit="handlePostEdit"
                @delete="handlePostDelete"/>
            </NTabPane>

            <!-- 加入的兴趣圈 Tab -->
            <NTabPane name="groups">
              <template #tab>
                <NSpace align="center" :size="6">
                  <span>{{ t('user.myGroups') }}</span>
                  <NTag size="small" :bordered="false" round>{{ mockData.groups.length }}</NTag>
                </NSpace>
              </template>
              <MyGroups :groups="mockData.groups" @click="handleGroupClick"/>
            </NTabPane>

            <!-- 我的收藏 Tab -->
            <NTabPane name="favorites">
              <template #tab>
                <NSpace align="center" :size="6">
                  <span>{{ t('user.myFavorites') }}</span>
                  <NTag size="small" :bordered="false" round>{{ mockData.favorites.length }}</NTag>
                </NSpace>
              </template>
              <MyFavorites
                :favorites="mockData.favorites"
                @remove="handleFavoriteRemove"
                @click="handleFavoriteClick"/>
            </NTabPane>

            <!-- 浏览历史 Tab -->
            <NTabPane name="history">
              <template #tab>
                <NSpace align="center" :size="6">
                  <span>{{ t('user.browseHistory') }}</span>
                  <NTag size="small" :bordered="false" round>{{ mockData.history.length }}</NTag>
                </NSpace>
              </template>
              <BrowseHistory
                :history="mockData.history"
                @clear="handleHistoryClear"
                @click="handleHistoryClick"/>
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
              <h2 class="sidebar-username">{{ userInfo.username || t('user.notSet') }}</h2>
              <NButton type="primary" size="small" @click="handleEditClick" style="width: 100%; margin-top: 16px; border-radius: 20px;">
                <template #icon>
                  <NIcon :size="14">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </NIcon>
                </template>
                {{ t('user.editProfile') }}
              </NButton>
            </div>

            <!-- 用户基本信息 -->
            <div class="sidebar-section">
              <!-- <NText depth="3" style="font-size: 12px; margin-bottom: 8px; display: block;">{{ t('user.basicInfo') }}</NText> -->
              <div class="info-list">
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">{{ t('user.email') }}</NText>
                  <NText style="font-size: 15px;">{{ userInfo.email || t('user.notSet') }}</NText>
                </div>
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">{{ t('user.phone') }}</NText>
                  <NText style="font-size: 15px;">{{ userInfo.phone || t('user.notBound') }}</NText>
                </div>
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">{{ t('user.gender') }}</NText>
                  <NTag :type="getGenderType(userInfo.gender)" size="small" round>
                    {{ getGenderText(userInfo.gender) }}
                  </NTag>
                </div>
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">{{ t('user.birthday') }}</NText>
                  <NText style="font-size: 15px;">{{ formatDate(userInfo.birthdate) }}</NText>
                </div>
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">{{ t('user.role') }}</NText>
                  <NTag :type="getRoleType(userInfo.role)" size="small" round>
                    {{ getRoleText(userInfo.role) }}
                  </NTag>
                </div>
                <div class="info-row">
                  <NText depth="3" style="font-size: 15px; margin-right: 1dvw;">{{ t('user.status') }}</NText>
                  <NTag :type="userInfo.status === 1 ? 'success' : 'error'" size="small" round>
                    {{ userInfo.status === 1 ? t('user.normal') : t('user.disabled') }}
                  </NTag>
                </div>
              </div>
            </div>

          </NCard>
        </div>
      </div>

      <!-- 编辑个人信息模态框 -->
      <NModal
        v-model:show="showEditModal"
        preset="card"
        :title="t('user.editModal.title')"
        class="edit-modal"
        :mask-closable="false"
        :bordered="false"
        :segmented="{ content: 'soft' }"
        size="huge"
        header-style="font-size: 26px;"
        :style="{ width: '50dvw', borderRadius: '24px' }">
        <NForm ref="formRef" :model="formData" :rules="rules" label-placement="top" size="large">
          <NFormItem :label="t('user.username')" path="username">
            <NInput
              v-model:value="formData.username"
              :placeholder="t('user.editModal.usernamePlaceholder')"
              maxlength="50"
              show-count
              size="large"
            />
          </NFormItem>

          <NFormItem :label="t('user.phone')" path="phone">
            <NInput
              v-model:value="formData.phone"
              :placeholder="t('user.editModal.phonePlaceholder')"
              maxlength="11"
              size="large"
            />
          </NFormItem>

          <NFormItem :label="t('user.gender')" path="gender">
            <NSelect
              v-model:value="formData.gender"
              :options="genderOptions"
              :placeholder="t('user.editModal.genderPlaceholder')"
              size="large"
            />
          </NFormItem>

          <NFormItem :label="t('user.birthday')" path="birthdate">
            <NDatePicker
              v-model:value="formData.birthdate"
              type="date"
              :placeholder="t('user.editModal.birthdayPlaceholder')"
              :is-date-disabled="(timestamp) => timestamp > Date.now()"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 100%;"
              size="large"
            />
          </NFormItem>

          <NFormItem :label="t('user.avatar')">
            <NUpload
              :max="1"
              :file-list="avatarFileList"
              list-type="image-card"
              :custom-request="handleAvatarUpload"
              @before-upload="beforeAvatarUpload"
              @update:file-list="handleFileListChange"
              accept="image/*"
            >
              <div style="text-align: center;">
                <div>{{ t('user.editModal.clickUploadAvatar') }}</div>
              </div>
            </NUpload>
            <template #feedback>
              <NText depth="3" style="font-size: 12px">{{ t('user.editModal.avatarTip') }}</NText>
            </template>
          </NFormItem>
        </NForm>

        <template #footer>
          <div class="modal-footer">
            <NButton @click="showEditModal = false">{{ t('common.cancel') }}</NButton>
            <NButton type="primary" @click="handleUpdateInfo" :loading="updating">
              {{ t('user.editModal.saveChanges') }}
            </NButton>
          </div>
        </template>
      </NModal>

      <!-- 头像裁剪弹窗（1:1，仅预览圆形头像） -->
      <ImageCropperModal
        v-model:show="cropperVisible"
        :image-src="cropperImageSrc"
        :aspect-ratio="1"
        :title="t('user.editModal.cropAvatarTitle')"
        type="avatar"
        avatar-only
        :avatar-url="formData.avatar_url"
        :preview-title="t('user.editModal.previewTitle')"
        :preview-hint="t('user.editModal.previewHint')"
        @confirm="handleCropConfirm"
        @cancel="handleCropCancel"
      />
    </div>
  </NConfigProvider>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NConfigProvider,
  NCard,
  NAvatar,
  NIcon,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NUpload,
  NSelect,
  NDatePicker,
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
import MyFavorites from '@/components/user-profile/MyFavorites.vue'
import BrowseHistory from '@/components/user-profile/BrowseHistory.vue'
import ImageCropperModal from '@/components/ImageCropperModal.vue'
import { auth } from '@/utils/auth'
import request from '@/utils/request'
import { updateUserInfo, uploadImage } from '@/api/user'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const offset = ref(260)

// 当前激活的标签页
const activeTab = ref('posts')

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

// 模拟数据
const mockData = ref({
  posts: [
    {
      id: 1,
      title: '分享一个超实用的Vue3组合式API使用技巧',
      content: '最近在项目中使用Vue3的组合式API，发现了一些很有用的技巧，比如利用computed来实现复杂的响应式逻辑...',
      authorName: '张三',
      authorAvatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
      time: '2小时前',
      images: ['https://picsum.photos/400/300?random=1', 'https://picsum.photos/400/300?random=2'],
      tags: ['Vue3', '前端开发'],
      comments: 24,
      likes: 156,
      views: 1234
    },
    {
      id: 2,
      title: 'TypeScript进阶：类型体操实战',
      content: '本文将介绍TypeScript中的高级类型特性，通过实际案例来演示如何使用条件类型、映射类型等...',
      authorName: '李四',
      authorAvatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
      time: '1天前',
      images: [],
      tags: ['TypeScript', '教程'],
      comments: 18,
      likes: 89,
      views: 567
    },
    {
      id: 3,
      title: '2024年前端技术栈选型建议',
      content: '随着前端技术的不断发展，选择合适的技术栈变得越来越重要。本文将分享一些关于技术栈选型的思考...',
      authorName: '王五',
      authorAvatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
      time: '3天前',
      images: ['https://picsum.photos/400/300?random=3'],
      tags: ['前端', '技术选型'],
      comments: 32,
      likes: 234,
      views: 1890
    }
  ],
  groups: [
    {
      id: 1,
      name: 'Vue.js爱好者',
      description: 'Vue.js技术交流与学习社区',
      avatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
      coverGradient: 'linear-gradient(135deg, rgba(66, 184, 131, 0.3) 0%, rgba(66, 184, 131, 0.1) 100%)',
      members: 1234,
      posts: 5678,
      role: 'admin'
    },
    {
      id: 2,
      name: '前端性能优化',
      description: '专注于前端性能优化的技术讨论',
      avatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
      coverGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.1) 100%)',
      members: 892,
      posts: 2341,
      role: 'member'
    },
    {
      id: 3,
      name: 'Node.js实战',
      description: 'Node.js后端开发经验分享',
      avatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
      coverGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%)',
      members: 567,
      posts: 1234,
      role: 'member'
    }
  ],
  favorites: [
    {
      id: 1,
      type: 'post',
      title: '深入理解React Hooks原理',
      description: '全面解析React Hooks的实现机制和使用技巧',
      time: '2024-01-10'
    },
    {
      id: 2,
      type: 'group',
      title: 'JavaScript高级编程',
      description: '深入学习JavaScript核心概念和高级特性',
      time: '2024-01-09'
    },
    {
      id: 3,
      type: 'post',
      title: 'Webpack配置完全指南',
      description: '从零开始学习Webpack的配置和优化',
      time: '2024-01-08'
    }
  ],
  history: [
    { id: 1, type: 'post', title: 'Vue3 Composition API 最佳实践', time: '今天 14:30', date: '今天' },
    { id: 2, type: 'group', title: 'React技术社区', time: '今天 11:20', date: '今天' },
    { id: 3, type: 'post', title: 'Node.js性能优化实战', time: '今天 09:15', date: '今天' },
    { id: 4, type: 'post', title: 'TypeScript高级类型技巧', time: '昨天 16:45', date: '昨天' },
    { id: 5, type: 'group', title: '前端架构师联盟', time: '昨天 14:20', date: '昨天' },
    { id: 6, type: 'post', title: '微前端架构设计方案', time: '3天前 10:30', date: '3天前' }
  ]
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await request.get('/user/get')
    if (response.data) {
      userInfo.value = response.data
    }
  } catch (error) {
    console.error(t('user.editModal.fetchFailed') + ':', error)
    message.error(t('user.editModal.fetchFailed'))
  }
}

// 编辑模态框相关
const showEditModal = ref(false)
const updating = ref(false)
const avatarFileList = ref([])

// 头像裁剪弹窗状态（选图后先裁剪再上传，与创建圈子流程一致）
const cropperVisible = ref(false)
const cropperImageSrc = ref('')
// pendingCrop 缓存本次裁剪上下文：NUpload 的 file 与 onFinish/onError
const pendingCrop = ref(null)

// 性别选项
const genderOptions = computed(() => [
  { label: t('user.genders.notSet'), value: 0 },
  { label: t('user.genders.male'), value: 1 },
  { label: t('user.genders.female'), value: 2 },
  { label: t('user.genders.other'), value: 3 }
])

// 表单数据
const formData = ref({
  username: '',
  phone: '',
  gender: 0,
  birthdate: null,
  avatar_url: ''
})

// 表单验证规则
const rules = {
  username: {
    required: false,
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (!value) return true
      if (value.length < 1 || value.length > 50) {
        return new Error(t('user.editModal.usernameLengthError'))
      }
      return true
    }
  },
  phone: {
    required: false,
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (!value) return true
      const phoneReg = /^1[3-9]\d{9}$/
      if (!phoneReg.test(value)) {
        return new Error(t('user.editModal.phoneFormatError'))
      }
      return true
    }
  }
}

// 上传前校验
const beforeAvatarUpload = (data) => {
  const file = data.file
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  const isValidType = allowedTypes.includes(file.type)

  if (!isValidType) {
    message.error(t('user.editModal.avatarTypeError'))
    return false
  }

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    message.error(t('user.editModal.avatarSizeError'))
    return false
  }

  return true
}

// 处理文件列表变化
const handleFileListChange = (fileList) => {
  avatarFileList.value = fileList
}

// 选图后不直接上传，先打开裁剪弹窗（1:1）
const handleAvatarUpload = ({ file, onFinish, onError }) => {
  if (cropperImageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(cropperImageSrc.value)
  }
  pendingCrop.value = { file, onFinish, onError }
  cropperImageSrc.value = URL.createObjectURL(file.file)
  cropperVisible.value = true
}

// 裁剪确认 → 上传裁剪结果
const handleCropConfirm = async (blob) => {
  const p = pendingCrop.value
  if (!p) return
  try {
    const croppedFile = new File([blob], 'cropped-avatar.jpg', { type: 'image/jpeg' })
    const response = await uploadImage(croppedFile)
    if (response.data && response.data.url) {
      formData.value.avatar_url = response.data.url
      message.success(t('user.editModal.avatarUploadSuccess'))
      p.onFinish()
    } else {
      message.error(t('user.editModal.avatarUploadFailed'))
      p.onError()
    }
  } catch (error) {
    console.error('裁剪后上传失败:', error)
    message.error(t('user.editModal.avatarUploadFailed'))
    p.onError()
  } finally {
    pendingCrop.value = null
    if (cropperImageSrc.value.startsWith('blob:')) {
      URL.revokeObjectURL(cropperImageSrc.value)
      cropperImageSrc.value = ''
    }
  }
}

// 取消裁剪 → 放弃本次上传
const handleCropCancel = () => {
  const p = pendingCrop.value
  if (p) p.onError()
  pendingCrop.value = null
  if (cropperImageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(cropperImageSrc.value)
    cropperImageSrc.value = ''
  }
}

// 更新用户信息
const handleUpdateInfo = async () => {
  try {
    const hasChanges =
      formData.value.username ||
      formData.value.phone ||
      formData.value.avatar_url ||
      formData.value.gender !== undefined ||
      formData.value.birthdate

    if (!hasChanges) {
      message.warning(t('user.editModal.noChangesWarning'))
      return
    }

    updating.value = true

    const updateData = {}

    if (formData.value.username) {
      updateData.username = formData.value.username
    }
    if (formData.value.phone) {
      updateData.phone = formData.value.phone
    }
    if (formData.value.avatar_url) {
      updateData.avatar_url = formData.value.avatar_url
    }
    if (formData.value.gender !== undefined && formData.value.gender !== null) {
      updateData.gender = formData.value.gender
    }
    if (formData.value.birthdate) {
      updateData.birthdate = new Date(formData.value.birthdate).toISOString()
    }

    await updateUserInfo(updateData)
    message.success(t('user.editModal.updateSuccess'))
    showEditModal.value = false
    avatarFileList.value = []
    await fetchUserInfo()
  } catch (error) {
    console.error('更新个人信息失败:', error)
    message.error(error.message || t('user.editModal.updateFailed'))
  } finally {
    updating.value = false
  }
}

// 打开编辑模态框
const openEditModal = () => {
  let birthdateTimestamp = null
  if (userInfo.value.birthdate) {
    birthdateTimestamp = new Date(userInfo.value.birthdate).getTime()
  }

  formData.value = {
    username: userInfo.value.username || '',
    phone: userInfo.value.phone || '',
    gender: userInfo.value.gender ?? 0,
    birthdate: birthdateTimestamp,
    avatar_url: userInfo.value.avatar_url || ''
  }

  if (userInfo.value.avatar_url) {
    avatarFileList.value = [{
      id: 'avatar',
      name: 'avatar.jpg',
      status: 'finished',
      url: userInfo.value.avatar_url
    }]
  } else {
    avatarFileList.value = []
  }

  showEditModal.value = true
}

// 编辑按钮点击事件
const handleEditClick = () => {
  openEditModal()
}

// 帖子操作
const handlePostEdit = (post) => {
  message.info(`编辑帖子: ${post.title}`)
}

const handlePostDelete = (post) => {
  message.warning(`删除帖子: ${post.title}`)
}

// 兴趣圈操作
const handleGroupClick = (group) => {
  message.info(`进入兴趣圈: ${group.name}`)
}

// 收藏操作
const handleFavoriteRemove = (item) => {
  message.info(`移除收藏: ${item.title}`)
}

const handleFavoriteClick = (item) => {
  message.info(`查看收藏: ${item.title}`)
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return t('user.notSet')
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 获取性别文本
const getGenderText = (gender) => {
  const genderMap = {
    0: t('user.genders.notSet'),
    1: t('user.genders.male'),
    2: t('user.genders.female'),
    3: t('user.genders.other')
  }
  return genderMap[gender] || t('user.genders.notSet')
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
    0: t('user.roles.user'),
    1: t('user.roles.admin'),
    2: t('user.roles.superAdmin')
  }
  return roleMap[role] || t('user.roles.user')
}

// 获取角色标签类型
const getRoleType = (role) => {
  const typeMap = {
    0: 'default',
    1: 'warning',
    2: 'error'
  }
  return typeMap[role] || 'default'
}

// 历史操作
const handleHistoryClear = () => {
  message.info(t('user.editModal.clearHistory'))
}

const handleHistoryClick = (item) => {
  message.info(`跳转到: ${item.title}`)
}

onMounted(() => {
  if (!auth.isAuthenticated()) {
    message.warning(t('messages.pleaseLoginFirst'))
    router.push('/')
    return
  }
  fetchUserInfo()
})
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
}

.main-content {
  margin-top: 7dvh;
  padding: 24px;
  min-height: calc(100dvh - 64px);
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
  /* padding: 5px 5px; */
  /* background: rgba(255, 255, 255, 0.02); */
  border-radius: 10px;
  transition: background 0.2s;
}

.info-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

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

.profile-tabs :deep(.n-tab-pane) {
  padding: 24px 0 0 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.avatar-font{
  font-size: 10dvw;
  /* margin-bottom: 3dvh; */
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
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

<!--
  编辑模态框样式：使用非 scoped 全局块。
  NModal 会将内容 teleport 到 body，scoped + class 前缀的 :deep 选择器无法命中
  teleport 出去的 DOM（class 与 data-v 落在不同元素上）。这里用 .edit-modal 前缀
  做范围限定，保证只影响本弹窗，且能稳定穿透 teleport。
-->
<style>
/* ===== 卡片整体：圆润 + 玻璃质感 ===== */
.edit-modal .n-card {
  border-radius: 24px !important;
  box-shadow: var(--shadow-lg) !important;
  background: var(--glass-bg) !important;
  border: 1px solid var(--glass-border) !important;
  overflow: hidden;
}

.edit-modal .n-card-header {
  border-radius: 24px 24px 0 0 !important;
}

.edit-modal .n-card-header__main,
.edit-modal .n-card-header__title {
  font-size: 26px !important;
  font-weight: 700 !important;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.edit-modal .n-form-item {
  margin-bottom: 5px;
}

.edit-modal .n-form-item-label {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 14px !important;
}

/* ===== 输入框 / 选择框 / 日期：更高、更圆 ===== */
.edit-modal .n-input,
.edit-modal .n-base-selection {
  --n-border-radius: 14px !important;
  --n-height: 52px !important;
  font-size: 15px;
}

.edit-modal .n-base-selection-label {
  min-height: 52px !important;
}

.edit-modal .n-input__textarea-el {
  font-size: 15px;
  line-height: 1.7;
}

/* 聚焦态：绿色边框 + 柔光晕（与创建圈子一致） */
.edit-modal .n-input--focus,
.edit-modal .n-base-selection:focus-within {
  --n-border-focus: 1px solid #18a058 !important;
  --n-box-shadow-focus: 0 0 0 3px rgba(24, 160, 88, 0.18) !important;
}

/* ===== 按钮：圆角 + 高度，主按钮绿色渐变 ===== */
.edit-modal .n-button {
  --n-border-radius: 14px !important;
  --n-height: 46px !important;
  transition: all 0.2s ease;
}

.edit-modal .n-button--primary-type {
  background: var(--primary-gradient) !important;
  border: none !important;
  color: #07140d !important;
  font-weight: 600 !important;
}

.edit-modal .n-button--primary-type:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(34, 179, 106, 0.35);
  opacity: 0.95;
}

/* ===== 图片上传卡片：圆润化 ===== */
.edit-modal .n-upload-trigger--image-card,
.edit-modal .n-upload-file-list__item {
  border-radius: 16px !important;
  transition: all 0.2s ease;
}

.edit-modal .n-upload-trigger--image-card:hover {
  border-color: #18a058 !important;
  color: #18a058 !important;
}
</style>
