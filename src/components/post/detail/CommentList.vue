<template>
  <NCard ref="commentListCardRef" :bordered="false" class="comment-list-card">
    <div class="comment-list-header">
      <span class="comment-section-title">{{ t('comment.list.title', { count: props.commentCount }) }}</span>
      <div class="comment-sort">
        <NButton text size="small" :type="sort === 'hottest' ? 'primary' : 'default'" @click="$emit('update:sort', 'hottest')">{{ t('comment.sort.hottest') }}</NButton>
        <NDivider vertical />
        <NButton text size="small" :type="sort === 'newest' ? 'primary' : 'default'" @click="$emit('update:sort', 'newest')">{{ t('comment.sort.newest') }}</NButton>
      </div>
    </div>

    <div class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-avatar">
          <NAvatar round :size="36" :src="comment.author_avatar || undefined">
          <div v-if="comment.author_avatar===undefined">{{ comment.author_name.charAt(0) }}</div>
          </NAvatar>
        </div>
        <div class="comment-body">
          <div class="comment-author-row">
            <SmartLink class="comment-author" :class="{ clickable: getUserId(comment) }" :to="userUrl(getUserId(comment))">{{ comment.author_name }}</SmartLink>
            <span class="comment-time">{{ formatTime(comment.create_time) }}</span>
          </div>
          <ImageCarousel
            v-if="getCommentImages(comment).length"
            :images="getCommentImages(comment)"
            :parent-width="800"
          />
          <div class="comment-content">
            <MentionPreview
              :content="comment.content"
              :language="language"
            />
          </div>
          <div class="comment-actions">
            <NButton text size="small" class="comment-action-btn" :class="{ 'liked-btn': comment.liked }" @click="handleToggleLike('comment', comment)">
              <template #icon>
                <NIcon size="16">
                  <svg viewBox="0 0 24 24" :fill="comment.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </NIcon>
              </template>
              {{ formatNumber(comment.like_count) }}
            </NButton>
            <NButton text size="small" class="comment-action-btn" @click="openReply(comment)">
              <template #icon>
                <NIcon size="16">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </NIcon>
              </template>
              {{ t('comment.actions.reply') }}
            </NButton>
          </div>

          <!-- 内联回复编辑器 -->
          <CommentReplyEditor
            v-if="activeReplyId === comment.id"
            :post-id="postId"
            :root-id="comment.id"
            :reply-to-id="null"
            :reply-to-name="comment.author_name"
            :language="language"
            @submit="handleReplySubmit(comment, $event)"
            @cancel="activeReplyId = null"
          />

          <!-- 点击查看回复 -->
          <div
            v-if="comment.reply_count > 0 && !isRepliesExpanded(comment.id)"
            class="load-replies-btn"
            @click="loadReplies(comment)"
          >
            <NSpin v-if="loadingReplies[comment.id]" :size="14" />
            <span v-else>{{ t('comment.list.viewReplies', { count: comment.reply_count }) }}</span>
          </div>

          <!-- 子评论 -->
          <div v-if="isRepliesExpanded(comment.id)" class="comment-replies" :class="{ 'replies-loading': getRepliesData(comment.id).pageLoading || getRepliesData(comment.id).sortLoading }">
            <!-- 回复列表头部：排序切换 -->
            <div class="comment-replies-header">
              <div class="replies-sort-toggle">
                <span
                  class="sort-option"
                  :class="{ active: repliesSort === 1, disabled: getRepliesData(comment.id).sortLoading }"
                  @click="repliesSort !== 1 && !getRepliesData(comment.id).sortLoading && toggleRepliesSort(comment.id)"
                >
                  {{ t('comment.sort.newest') }}
                </span>
                <span class="sort-divider">/</span>
                <span
                  class="sort-option"
                  :class="{ active: repliesSort === 0, disabled: getRepliesData(comment.id).sortLoading }"
                  @click="repliesSort !== 0 && !getRepliesData(comment.id).sortLoading && toggleRepliesSort(comment.id)"
                >
                  {{ t('comment.sort.hottest') }}
                </span>
              </div>
            </div>
            <div v-for="reply in getCurrentReplies(comment.id)" :key="reply.id" class="comment-item reply-item">
              <div class="comment-avatar">
                <NAvatar round :size="28" :src="reply.author_avatar || undefined">
                  <div v-if="reply.author_avatar===undefined">{{ reply.author_name.charAt(0) }}</div>
                </NAvatar>
              </div>
              <div class="comment-body">
                <div class="comment-author-row">
                  <SmartLink class="comment-author" :class="{ clickable: getUserId(reply) }" :to="userUrl(getUserId(reply))">{{ reply.author_name }}</SmartLink>
                  <template v-if="getReplyToName(reply, getCurrentReplies(comment.id))">
                    <span class="reply-arrow">{{ t('comment.actions.reply') }}</span>
                    <SmartLink class="comment-author reply-to-name" :class="{ clickable: getReplyToUserId(reply, getCurrentReplies(comment.id)) }" :to="userUrl(getReplyToUserId(reply, getCurrentReplies(comment.id)))">@{{ getReplyToName(reply, getCurrentReplies(comment.id)) }}</SmartLink>
                  </template>
                  <span class="comment-time">{{ formatTime(reply.create_time) }}</span>
                </div>
                <ImageCarousel
                  v-if="getCommentImages(reply).length"
                  :images="getCommentImages(reply)"
                  :parent-width="670"
                />
                <div class="comment-content">
                  <MentionPreview
                    :content="reply.content"
                    :language="language"
                  />
                </div>
                <div class="comment-actions">
                  <NButton text size="small" class="comment-action-btn" :class="{ 'liked-btn': reply.liked }" @click="handleToggleLike('comment', reply)">
                    <template #icon>
                      <NIcon size="16">
                        <svg viewBox="0 0 24 24" :fill="reply.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </NIcon>
                    </template>
                    {{ formatNumber(reply.like_count) }}
                  </NButton>
                  <NButton text size="small" class="comment-action-btn" @click="openReply(reply, comment)">
                    <template #icon>
                      <NIcon size="16">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                      </NIcon>
                    </template>
                    {{ t('comment.actions.reply') }}
                  </NButton>
                </div>

                <!-- 内联回复编辑器（回复子评论） -->
                <CommentReplyEditor
                  v-if="activeReplyId === reply.id"
                  :post-id="postId"
                  :root-id="comment.id"
                  :reply-to-id="reply.id"
                  :reply-to-name="reply.author_name"
                  :language="language"
                  @submit="handleReplySubmit(comment, $event)"
                  @cancel="activeReplyId = null"
                />
              </div>
            </div>

            <!-- 收起回复和翻页 -->
            <div class="replies-footer">
              <div class="collapse-replies-btn" @click="collapseReplies(comment.id)">
                {{ t('comment.list.collapseReplies') }}
              </div>
              <div v-if="getTotalPages(comment.id) > 1 || hasNextPage(comment.id)" class="replies-pagination-arrows">
                <NSpin v-if="getRepliesData(comment.id).pageLoading" :size="14" />
                <template v-else>
                  <!-- 上一页 -->
                  <button
                    class="page-arrow-btn"
                    :disabled="!hasPrevPage(comment.id)"
                    @click="prevPage(comment.id)"
                  >
                    <NIcon size="14">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </NIcon>
                  </button>
                  <!-- 页码显示 -->
                  <span class="page-number">
                    {{ getCurrentPageNumber(comment.id) }} / {{ Math.max(1, Math.ceil(comment.reply_count / 10)) }}
                  </span>
                  <!-- 下一页 -->
                  <button
                    class="page-arrow-btn"
                    :disabled="!hasNextPage(comment.id)"
                    @click="nextPage(comment.id)"
                  >
                    <NIcon size="14">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </NIcon>
                  </button>
                </template>
              </div>
            </div>

            <!-- 加载遮罩 -->
            <div v-if="getRepliesData(comment.id).pageLoading || getRepliesData(comment.id).sortLoading" class="replies-loading-overlay">
              <NSpin :size="24" />
            </div>
          </div>
        </div>
      </div>

      <!-- 无限滚动触发器 -->
      <div v-if="hasMore && !loading" class="load-more-trigger" ref="loadMoreTrigger"></div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <NSpin size="medium" />
      </div>

      <!-- 没有更多 -->
      <div v-if="!hasMore && comments.length > 0" class="no-more">
        <p>{{ t('comment.list.noMore') }}</p>
      </div>

      <NEmpty v-if="!loading && comments.length === 0 && initialized" :description="t('comment.list.empty')" >
      <template #icon>
          <NIcon>
            <CommentRound/>
          </NIcon>
        </template>
      </NEmpty> 
    </div>
  </NCard>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
	import { NCard, NAvatar, NButton, NDivider, NIcon, NEmpty, NSpin } from 'naive-ui'
import ImageCarousel from './ImageCarousel.vue'
import { useI18n } from 'vue-i18n'
import MentionPreview from '@/components/MentionPreview.vue'
import SmartLink from '@/components/SmartLink.vue'
import { getCommentList, getCommentReplies } from '@/api/comment'
import { seedContentMentions } from '@/utils/mentionResolve'
import { toggleLike } from '@/api/like'
import CommentReplyEditor from './CommentReplyEditor.vue'
import {CommentRound} from '@vicons/material'
import { useFormatTime, useFormatNumber } from '@/utils/i18n'
import { useThrottleFn, useDebounceFn } from '@/utils/throttle'
import { auth } from '@/utils/auth'
import { requireLogin } from '@/utils/guest-action'

const props = defineProps({
  postId: {
    type: String,
    required: true
  },
  sort: {
    type: String,
    default: 'hottest'
  },
  language: {
    type: String,
    default: 'zh-CN'
  },
  commentCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:sort', 'update:commentCount'])

const { t } = useI18n()
const { formatTime } = useFormatTime()
const { formatNumber } = useFormatNumber()

// 获取用户ID（兼容多种字段名）
const getUserId = (item) => {
  return item.author_id || item.user_id || item.userId || item.authorId || item.id
}

// 作者名统一用 SmartLink 渲染为真实链接；无 id 时降级为纯文本块
const userUrl = (userId) => (userId ? `/user/${userId}` : null)

const getCommentImages = (item) => {
  if (!item.extra_data) return []
  try {
    const data = typeof item.extra_data === 'string' ? JSON.parse(item.extra_data) : item.extra_data
    return data?.images || []
  } catch {
    return []
  }
}

// 数据状态
const comments = ref([])
const loading = ref(false)
const hasMore = ref(false)
const nextCursor = ref('')
const initialized = ref(false)

// 回复展开状态和分页数据（游标分页 + 页面缓存）
// 格式: { [commentId]: { pages: [[]], currentPage: 0, cursors: [''], hasMoreMap: {}, loading: false } }
const repliesData = ref({})
const loadingReplies = ref({})

// 回复排序状态：0=最热（最多点赞），1=最新（默认）
const repliesSort = ref(1)

// 获取某个评论的回复数据
const getRepliesData = (commentId) => {
  if (!repliesData.value[commentId]) {
    repliesData.value[commentId] = {
      pages: [[]],           // 每页的数据
      currentPage: 0,        // 当前页码（从0开始）
      cursors: [''],         // 每页对应的游标
      hasMoreMap: {},        // 每页是否有更多数据 {pageIndex: boolean}
      loading: false,
      pageLoading: false,    // 页面加载状态（用于显示遮罩）
      sortLoading: false     // 排序切换加载状态
    }
  }
  return repliesData.value[commentId]
}

// 获取当前显示的回复列表
const getCurrentReplies = (commentId) => {
  const data = getRepliesData(commentId)
  return data.pages[data.currentPage] || []
}

// 获取总页数
const getTotalPages = (commentId) => {
  const data = getRepliesData(commentId)
  return data.pages.length
}

// 获取当前页码（显示用，从1开始）
const getCurrentPageNumber = (commentId) => {
  const data = getRepliesData(commentId)
  return data.currentPage + 1
}

// 是否有下一页
const hasNextPage = (commentId) => {
  const data = getRepliesData(commentId)
  return data.hasMoreMap[data.currentPage] || false
}

// 是否有上一页
const hasPrevPage = (commentId) => {
  const data = getRepliesData(commentId)
  return data.currentPage > 0
}

// 展开的回复ID列表（用于控制显示）
const expandedReplyIds = ref([])

// 检查回复是否展开
const isRepliesExpanded = (commentId) => {
  return expandedReplyIds.value.includes(commentId)
}

// 展开回复
const expandReplies = (commentId) => {
  if (!expandedReplyIds.value.includes(commentId)) {
    expandedReplyIds.value.push(commentId)
  }
}

// 收起回复
const collapseReplies = (commentId) => {
  expandedReplyIds.value = expandedReplyIds.value.filter(id => id !== commentId)
  // 重置该评论的回复数据，下次展开重新加载
  delete repliesData.value[commentId]
}

// 重置回复数据（切换排序时使用）
const resetRepliesData = (commentId) => {
  delete repliesData.value[commentId]
}

// 内联回复编辑器
const activeReplyId = ref(null)

// 获取被回复用户的名称
const getReplyToName = (reply, replies) => {
  // 如果后端已经返回 reply_to_name，直接使用
  if (reply.reply_to_name) {
    return reply.reply_to_name
  }
  // 如果有 reply_to_id 且非0，从回复列表中查找对应的用户名
  if (reply.reply_to_id && replies) {
    const targetReply = replies.find(r => r.id === reply.reply_to_id)
    return targetReply?.author_name
  }
  return null
}
// 获取被回复用户的ID
const getReplyToUserId = (reply, replies) => {
  // 优先使用后端返回的 reply_to_user_id
  if (reply.reply_to_user_id) {
    return reply.reply_to_user_id
  }
  // 如果有 reply_to_id 且非0，从回复列表中查找对应的用户ID
  if (reply.reply_to_id && replies) {
    const targetReply = replies.find(r => r.id === reply.reply_to_id)
    return targetReply?.author_id
  }
  return null
}

const openReply = (comment) => {
  activeReplyId.value = activeReplyId.value === comment.id ? null : comment.id
}

const debouncedLikeRequest = useDebounceFn(async (type, target) => {
  try {
    const res = await toggleLike({ type, target_id: target.id })
    if (res.data) {
      const serverLiked = res.data.is_liked
      if (target.liked !== serverLiked) {
        target.like_count = serverLiked
          ? target.like_count + 1
          : target.like_count - 1
        target.liked = serverLiked
      }
    }
  } catch {
    target.liked = !target.liked
    target.like_count = target.liked
      ? target.like_count + 1
      : target.like_count - 1
  }
}, 600)

const handleToggleLike = (type, target) => {
  // 访客点赞前置拦截：弹登录引导，不触发 401 硬跳转
  if (!auth.isAuthenticated()) {
    requireLogin('like')
    return
  }
  const newLiked = !target.liked
  target.liked = newLiked
  target.like_count = newLiked
    ? target.like_count + 1
    : target.like_count - 1
  debouncedLikeRequest(type, target)
}

const handleReplySubmit = async (parentComment, newReply) => {
  activeReplyId.value = null

  // 如果有新回复的数据，直接添加到前端列表
  if (newReply) {
    const data = getRepliesData(parentComment.id)

    // 确保第一页已加载
    if (!data.pages[0]) {
      data.pages[0] = []
    }

    // 将新回复添加到第一页的开头
    data.pages[0].unshift(newReply)

    // 更新父评论的回复计数
    parentComment.reply_count = (parentComment.reply_count || 0) + 1

    // 如果当前不在第一页，切换回第一页
    if (data.currentPage !== 0) {
      data.currentPage = 0
    }

    // 如果回复区域未展开，展开它
    if (!isRepliesExpanded(parentComment.id)) {
      expandReplies(parentComment.id)
    }
  } else {
    // 降级处理：如果没有返回数据，则重新加载
    resetRepliesData(parentComment.id)
    if (isRepliesExpanded(parentComment.id)) {
      await loadReplies(parentComment)
    } else if (parentComment.reply_count === 0) {
      await loadReplies(parentComment)
    }
  }
}

// 添加新评论到列表顶部
const addComment = (newComment) => {
  if (!newComment) return

  // 将新评论添加到列表顶部
  comments.value.unshift(newComment)

  // 更新评论总数
  emit('update:commentCount', (props.commentCount || 0) + 1)
}

// 无限滚动
const loadMoreTrigger = ref(null)
let observer = null

// 懒加载相关
const commentListCardRef = ref(null)
const commentsLoaded = ref(false)
let lazyObserver = null

// 排序映射：newest → 1（时间倒序），hottest → 0（点赞倒序）
const getSortValue = () => props.sort === 'newest' ? 1 : 0

// 回复排序值：0=最热（最多点赞），1=最新（默认）
const getRepliesSortValue = () => repliesSort.value

// 切换回复排序
const toggleRepliesSort = async (commentId) => {
  const data = getRepliesData(commentId)

  // 如果正在加载，忽略
  if (data.sortLoading) return

  // 切换排序值
  if (repliesSort.value === 0 || repliesSort.value === 1) {
    repliesSort.value = repliesSort.value === 0 ? 1 : 0
  }

  // 设置排序加载状态
  data.sortLoading = true

  try {
    // 重新加载第一页（使用新的排序值）
    const comment = comments.value.find(c => c.id === commentId)
    if (comment) {
      const params = {
        root_id: comment.id,
        sort: getRepliesSortValue()
      }

      const res = await getCommentReplies(params)
      if (res.data) {
        const items = res.data.items || []
        // 回灌提及用户（后端 mentions 字段）后再进响应式数据
        seedContentMentions(items)

        // 加载成功后，替换数据为第一页
        data.pages = [items]
        data.currentPage = 0
        data.cursors = ['', res.data.next_cursor || '']
        data.hasMoreMap = { 0: items.length > 0 && res.data.has_more }
      }
    }
  } catch (error) {
    console.error('切换排序失败:', error)
  } finally {
    data.sortLoading = false
  }
}

// 加载评论列表
const loadComments = async (isRefresh = false) => {
  if (loading.value) return
  if (!isRefresh && !hasMore.value && initialized.value) return

  loading.value = true
  try {
    const params = {
      post_id: props.postId,
      sort: getSortValue()
    }
    if (!isRefresh && nextCursor.value) {
      params.cursor = nextCursor.value
    }

    const res = await getCommentList(params)
    if (res.data) {
      // 回灌本页评论的提及用户（后端 mentions 字段），渲染前就位
      seedContentMentions(res.data.items || [])
      if (isRefresh) {
        comments.value = res.data.items || []
      } else {
        comments.value.push(...(res.data.items || []))
      }
      hasMore.value = res.data.has_more
      nextCursor.value = res.data.next_cursor || ''
    }
  } catch (error) {
    console.error('加载评论失败:', error)
  } finally {
    loading.value = false
    initialized.value = true

    // 评论加载完成后，设置无限滚动 observer
    if (hasMore.value) {
      await nextTick()
      setupInfiniteScrollObserver()
    }
  }
}

// 加载子回复（游标分页）
const loadReplies = async (comment) => {
  const data = getRepliesData(comment.id)

  // 如果正在加载，直接返回
  if (data.loading) return

  data.loading = true
  loadingReplies.value[comment.id] = true

  try {
    const params = {
      root_id: comment.id,
      sort: getRepliesSortValue()
    }

    // 非首页需要传游标
    if (data.currentPage > 0 && data.cursors[data.currentPage]) {
      params.cursor = data.cursors[data.currentPage]
    }

    const res = await getCommentReplies(params)
    if (res.data) {
      const items = res.data.items || []
      // 回灌提及用户（后端 mentions 字段）后再进响应式数据
      seedContentMentions(items)

      // 保存当前页数据
      data.pages[data.currentPage] = items
      data.cursors[data.currentPage + 1] = res.data.next_cursor || ''
      data.hasMoreMap[data.currentPage] = res.data.has_more

      // 展开回复区域
      expandReplies(comment.id)
    }
  } catch (error) {
    console.error('加载回复失败:', error)
  } finally {
    data.loading = false
    loadingReplies.value[comment.id] = false
  }
}

// 上一页（从缓存中读取）
const prevPage = (commentId) => {
  const data = getRepliesData(commentId)
  if (data.currentPage > 0) {
    data.currentPage = data.currentPage - 1
  }
}

// 下一页（可能需要加载）
const nextPage = async (commentId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (!comment) return

  const data = getRepliesData(commentId)

  // 如果正在加载，忽略
  if (data.pageLoading) return

  // 如果下一页已缓存，直接切换
  if (data.pages[data.currentPage + 1]) {
    data.currentPage = data.currentPage + 1
    return
  }

  // 如果当前页有更多数据，加载下一页
  if (data.hasMoreMap[data.currentPage] && !data.loading) {
    data.pageLoading = true
    loadingReplies.value[commentId] = true

    try {
      const params = {
        root_id: comment.id,
        sort: getRepliesSortValue(),
        cursor: data.cursors[data.currentPage + 1]
      }

      const res = await getCommentReplies(params)
      if (res.data) {
        const items = res.data.items || []
        // 回灌提及用户（后端 mentions 字段）后再进响应式数据
        seedContentMentions(items)

        // 保存到下一页
        const nextPageIndex = data.currentPage + 1
        data.pages[nextPageIndex] = items
        data.cursors[nextPageIndex + 1] = res.data.next_cursor || ''
        data.hasMoreMap[nextPageIndex] = res.data.has_more

        // 加载成功后才切换页面
        data.currentPage = nextPageIndex
      }
    } catch (error) {
      console.error('加载回复失败:', error)
    } finally {
      data.pageLoading = false
      loadingReplies.value[commentId] = false
    }
  }
}

// 刷新评论（供父组件调用）
const refreshComments = () => {
  // 清理 observer
  if (observer) {
    observer.disconnect()
    observer = null
  }

  // 重置状态
  comments.value = []
  hasMore.value = false
  nextCursor.value = ''
  repliesData.value = {}
  expandedReplyIds.value = []
  commentsLoaded.value = false

  // 重新设置懒加载（如果已经在视口内会立即触发）
  nextTick(() => {
    setupLazyObserver()
  })
}

// 监听排序变化
watch(() => props.sort, () => {
  refreshComments()
})

// 懒加载 Observer - 监听评论区容器进入视口
const setupLazyObserver = () => {
  if (!commentListCardRef.value || commentsLoaded.value) return

  lazyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !commentsLoaded.value) {
          commentsLoaded.value = true
          // 先清理可能存在的旧 observer
          if (observer) {
            observer.disconnect()
            observer = null
          }
          loadComments(true)
        }
      })
    },
    {
      rootMargin: '200px',
      threshold: 0.01
    }
  )

  lazyObserver.observe(commentListCardRef.value.$el || commentListCardRef.value)
}

// 无限滚动 Observer - 监听滚动到底部
const setupInfiniteScrollObserver = () => {
  if (!loadMoreTrigger.value) return

  // 先清理已存在的 observer
  if (observer) {
    observer.disconnect()
    observer = null
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMore.value && !loading.value) {
          loadComments()
        }
      })
    },
    {
      rootMargin: '100px',
      threshold: 0.1
    }
  )

  observer.observe(loadMoreTrigger.value)
}

const cleanupObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (lazyObserver) {
    lazyObserver.disconnect()
    lazyObserver = null
  }
}

onMounted(() => {
  setupLazyObserver()
})

onUnmounted(() => {
  cleanupObserver()
})

defineExpose({ refreshComments, addComment })
</script>

<style scoped>
.comment-list-card {
  border-radius: 16px !important;
}

.comment-section-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.comment-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.comment-sort {
  display: flex;
  align-items: center;
  gap: 4px;
}

.comment-list {
  display: flex;
  flex-direction: column;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-author-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-author {
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
}

.comment-author.clickable {
  cursor: pointer;
  transition: color 0.2s;
}

.comment-author.clickable:hover {
  color: #63e2b7;
}
.comment-time {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.comment-content {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  word-break: break-word;
}

.comment-content :deep(.md-editor) {
  background: transparent !important;
}

.comment-content :deep(.md-editor-preview) {
  padding: 0 !important;
  font-size: 15px;
}

.comment-content :deep(.md-editor-preview-wrapper) {
  padding: 0 !important;
}

.comment-actions {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.comment-action-btn {
  color: rgba(255, 255, 255, 0.45) !important;
  font-size: 13px;
}

.comment-action-btn:hover {
  color: rgba(255, 255, 255, 0.7) !important;
}

.comment-action-btn.liked-btn {
  color: #f472b6 !important;
}

.comment-action-btn.liked-btn:hover {
  color: #ec4899 !important;
}

/* 查看回复按钮 */
.load-replies-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 4px 0;
  font-size: 13px;
  color: #63e2b7;
  cursor: pointer;
  user-select: none;
}

.load-replies-btn:hover {
  color: #7fe7c4;
}

/* 子评论区 */
.comment-replies {
  position: relative;
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

/* 加载状态下的遮罩效果 */
.comment-replies.replies-loading {
  pointer-events: none;
}

/* 加载遮罩层 */
.replies-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  z-index: 10;
}

/* 回复列表头部 */
.comment-replies-header {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 4px;
  padding-bottom: 4px;
}

.comment-replies .comment-item {
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.comment-replies .comment-item:last-child {
  border-bottom: none;
}

.reply-item .comment-author {
  font-size: 14px;
}

.reply-arrow {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
}

.reply-to-name {
  color: #63e2b7;
}

/* 收起回复和翻页容器 */
.replies-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

/* 回复排序切换器 */
.replies-sort-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.sort-option {
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: color 0.2s;
}

.sort-option:hover {
  color: rgba(255, 255, 255, 0.6);
}

.sort-option.active {
  color: #63e2b7;
}

.sort-option.disabled {
  opacity: 0.4;
  pointer-events: none;
  cursor: not-allowed;
}

.sort-divider {
  color: rgba(255, 255, 255, 0.2);
}

/* 收起回复 */
.collapse-replies-btn {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  user-select: none;
}

.collapse-replies-btn:hover {
  color: rgba(255, 255, 255, 0.6);
}

/* 翻页箭头容器 */
.replies-pagination-arrows {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 翻页箭头按钮 */
.page-arrow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.page-arrow-btn:hover:not(:disabled) {
  background: rgba(99, 226, 183, 0.1);
  border-color: rgba(99, 226, 183, 0.3);
  color: #63e2b7;
}

.page-arrow-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 页码显示 */
.page-number {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  min-width: 40px;
  text-align: center;
}

/* 无限滚动触发器 */
.load-more-trigger {
  height: 1px;
  margin-top: 20px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

/* 没有更多 */
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

.no-more::before,
.no-more::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 20px;
}

:deep(.md-editor-dark) {
  --md-bk-color: rgb(24, 24, 28);
  --md-scrollbar-bg-color: rgb(24, 24, 28);
}

:deep(.md-editor-dark .md-editor-preview) {
  --md-theme-bg-color: rgb(24, 24, 28);
}

:deep(.n-image-preview){
  z-index: 9999 !important;
}
</style>

