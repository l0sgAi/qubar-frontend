<template>
  <div class="post-detail-page">
    <!-- 顶栏 + 侧边栏（移动端外框切换见 AppShell） -->
    <AppShell v-model:offset="offset" />

    <!-- 主内容区域 -->
    <div class="main-content" :style="contentStyle">
      <div v-if="loading" class="loading-container">
        <NSpin size="large" />
      </div>

      <div v-else-if="post" class="post-detail-container">
        <!-- 左侧内容列 -->
        <div class="post-main-column">
            <PostHeaderAndContent
              :post="post"
              :language="language"
              @like="handleLike"
              @collect="handleCollect"
            >
            <CommentEditor
              :post-id="route.params.id"
              :circle-id="post.circle_id"
              :language="language"
              @submit="handleSubmitComment"
              @upload-img="handleCommentUploadImg"
            />

            <CommentList
              ref="commentListRef"
              :post-id="route.params.id"
              :circle-id="post.circle_id"
              v-model:sort="commentSort"
              v-model:comment-count="commentCount"
              :language="language"
              :locate-comment-id="route.query.comment_id || ''"
            />
          </PostHeaderAndContent>
        </div>

        <!-- 右侧圈子信息卡片 -->
        <div class="right-sidebar">
          <CircleInfoCard
            v-if="post && post.circle_id"
            :circleId="post.circle_id"
          />
        </div>
      </div>

      <NEmpty v-else :description="t('post.postNotFound')" >
        <template #icon>
          <NIcon>
            <ArticleRound/>
          </NIcon>
        </template>
      </NEmpty> 
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { NSpin, NEmpty, useMessage, NIcon } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import AppShell from '@/components/layout/AppShell.vue'
import { useAppShell } from '@/composables/useAppShell'
import CircleInfoCard from '@/components/circle/CircleInfoCard.vue'
import PostHeaderAndContent from '@/components/post/detail/PostHeaderAndContent.vue'
import CommentEditor from '@/components/post/detail/CommentEditor.vue'
import CommentList from '@/components/post/detail/CommentList.vue'
import { getPostDetail } from '@/api/post'
import { usePageTitle } from '@/composables/usePageTitle'
import { useInteractionToggle, interactionErrorMessage } from '@/composables/useInteractionToggle'
import { toggleLike } from '@/api/like'
import { toggleCollect } from '@/api/collect'
import { getCircleDetail } from '@/api/circle'
import { auth } from '@/utils/auth'
import { requireLogin } from '@/utils/guest-action'
import { seedContentMentions } from '@/utils/mentionResolve'
import {ArticleRound} from '@vicons/material'

const route = useRoute()
const message = useMessage()
const { t } = useI18n()
const { setTitleData } = usePageTitle()

// 注入圈子搜索状态设置方法
const setCircleSearch = inject('setCircleSearch', () => {})

const loading = ref(true)
const post = ref(null)
const language = ref('zh-CN')
// 侧栏宽度与内容区偏移（移动端外框下不偏移），见 composables/useAppShell.js
const { offset, contentStyle } = useAppShell()
// 加载帖子详情
const loadPostDetail = async () => {
  try {
    loading.value = true
    const postId = route.params.id
    const res = await getPostDetail(postId)

    if (res.data) {
      // 先回灌后端回传的提及用户，再进响应式渲染 → 链接化零搜索精确建链
      seedContentMentions([res.data])
      post.value = res.data
      // 设置评论数
      commentCount.value = res.data.comment_count || 0

      // 数据加载成功后用帖子标题覆盖标签页标题
      if (post.value.title) {
        setTitleData('title.postDetailName', { name: post.value.title })
      }

      // 设置圈子搜索状态
      if (post.value.circle_id) {
        try {
          const circleRes = await getCircleDetail(post.value.circle_id)
          if (circleRes.data) {
            setCircleSearch({
              id: circleRes.data.id,
              name: circleRes.data.name,
              avatar_url: circleRes.data.avatar_url
            })
          }
        } catch (error) {
          console.error('获取圈子信息失败:', error)
        }
      }
    } else {
      message.error(t('post.postNotFound'))
    }
  } catch (error) {
    console.error('加载帖子详情失败:', error)
    message.error(t('messages.getDetailFailed', { error: error.message }))
  } finally {
    loading.value = false
  }
}

// 点赞 / 收藏：乐观更新 UI，按帖子 id 防抖串行提交期望状态（显式 action，幂等可重试）
// ctx 捕获点击时的帖子对象，避免防抖期间切换到其它帖子后打错目标
const likeToggle = useInteractionToggle({
  request: async (postId, desired) => {
    const res = await toggleLike({ type: 'post', target_id: postId, action: desired ? 'like' : 'unlike' })
    return res.data.is_liked
  }
})

const collectToggle = useInteractionToggle({
  request: async (postId, desired) => {
    const res = await toggleCollect({ post_id: postId, action: desired ? 'collect' : 'uncollect' })
    return res.data.is_collected
  }
})

const notifyInteractionError = (error) => {
  message.error(interactionErrorMessage(error, t))
}

const setPostLiked = (target, liked) => {
  if (target.is_liked === liked) return
  target.is_liked = liked
  target.like_count = liked ? target.like_count + 1 : target.like_count - 1
}

const handleLike = () => {
  if (!post.value) return
  // 访客点赞前置拦截：避免触发 401 硬跳转，改为弹登录引导
  if (!auth.isAuthenticated()) {
    requireLogin('like')
    return
  }
  const target = post.value
  setPostLiked(target, !target.is_liked)
  likeToggle.schedule(target.id, {
    get: () => target.is_liked,
    apply: (liked) => setPostLiked(target, liked),
    onError: notifyInteractionError
  })
}

// 收藏数 collect_count 由后端异步聚合，前端不本地 ±1（对接文档约定）
const handleCollect = () => {
  if (!post.value) return
  // 访客收藏前置拦截
  if (!auth.isAuthenticated()) {
    requireLogin('collect')
    return
  }
  const target = post.value
  target.is_collected = !target.is_collected
  collectToggle.schedule(target.id, {
    get: () => target.is_collected,
    apply: (collected) => { target.is_collected = collected },
    onError: notifyInteractionError
  })
}

// ============ 评论区相关 ============
const commentSort = ref('hottest')
const commentListRef = ref(null)
const commentCount = ref(0) // 独立的评论数变量

// 提交评论（API 调用已在 CommentEditor 内部完成，此处只做后续处理）
const handleSubmitComment = (newComment) => {
  // 直接将新评论添加到列表中，而不是刷新整个列表
  if (newComment) {
    commentListRef.value?.addComment(newComment)
  } else {
    // 降级处理：如果没有返回数据，则刷新列表
    commentListRef.value?.refreshComments()
  }
}

// 评论图片上传
const handleCommentUploadImg = async (files, callback) => {
  // TODO: 对接图片上传API
  const urls = await Promise.all(
    files.map(() => Promise.resolve('https://via.placeholder.com/300'))
  )
  callback(urls)
}

onMounted(() => {
  loadPostDetail()
})
</script>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  position: relative;
}

.main-content {
  margin-top: var(--header-height);
  min-height: calc(100vh - var(--header-height));
  transition: margin-left 0.3s ease, width 0.3s ease;
}

.post-detail-container {
  display: flex;
  gap: 24px;
  width: 100%;
  align-items: flex-start;
  justify-content: center;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.post-main-column {
  flex: 1;
  max-width: 53dvw;
  min-width: 40dvw;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 右侧悬浮栏 */
.right-sidebar {
  width: 23dvw;
  flex-shrink: 0;
  position: sticky;
  top: calc(var(--header-height) + 24px);
  max-height: calc(100vh - var(--header-height) - 24px);
  max-height: calc(100dvh - var(--header-height) - 24px);
  overflow-y: auto;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.right-sidebar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 响应式 */
@media (max-width: 1400px) {
  .main-content {
    margin-right: 24px;
  }

  .right-sidebar {
    width: 320px;
  }
}

@media (max-width: 1200px) {
  .right-sidebar {
    display: none;
  }

  .main-content {
    margin-right: 24px;
    margin-left: 80px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-right: 0;
    padding: 16px;
  }

  .post-detail-container {
    max-width: 100%;
  }
}
</style>
