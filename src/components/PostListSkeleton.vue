<template>
  <!-- 帖子列表骨架屏：模拟 PostCard 结构（头像 + 用户名/时间 + 标题 + 正文行），
       NSkeleton 自带波浪微光动画；用于首屏/切 tab 加载，替代 spinner -->
  <div class="post-list-skeleton" aria-hidden="true">
    <div v-for="n in count" :key="n" class="skeleton-card">
      <div class="sk-header">
        <NSkeleton circle :width="40" :height="40" />
        <div class="sk-meta">
          <NSkeleton text :width="120" />
          <NSkeleton text :width="80" class="sk-meta-sub" />
        </div>
      </div>
      <NSkeleton text width="60%" class="sk-title" />
      <NSkeleton text :repeat="2" />
      <NSkeleton text width="35%" />
    </div>
  </div>
</template>

<script setup>
import { NSkeleton } from 'naive-ui'

defineProps({
  // 渲染的骨架卡片数
  count: {
    type: Number,
    default: 3
  }
})
</script>

<style scoped>
.skeleton-card {
  padding: 20px 0;
  border-bottom: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
}

.skeleton-card:last-child {
  border-bottom: none;
}

.sk-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.sk-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sk-meta-sub {
  height: 12px;
}

.sk-title {
  height: 20px;
  margin-bottom: 12px;
}
</style>
