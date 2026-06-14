<template>
  <!-- 复刻 CircleDetail.vue 的 .circle-header：封面横幅 + 圆形头像 + 圈子名称/slug -->
  <div class="circle-header" :style="{ backgroundImage: headerBg }">
    <div class="header-overlay">
      <div class="header-content">
        <div class="circle-avatar-wrapper">
          <img v-if="avatarUrl" :src="avatarUrl" class="circle-avatar" />
          <div v-else class="circle-avatar-placeholder">
            {{ initial }}
          </div>
          <div class="circle-info">
            <h1 class="circle-name" :class="{ 'is-placeholder': !name }">{{ displayName }}</h1>
            <p class="circle-slug">c/{{ displaySlug }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  coverUrl: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  name: { type: String, default: '' },
  slug: { type: String, default: '' }
})

const { t } = useI18n()

// 与 CircleDetail.vue coverImageStyle 保持一致
const headerBg = computed(() => {
  if (props.coverUrl) {
    return `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(16,16,28,1)), url(${props.coverUrl})`
  }
  return 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(168,85,247,0.2) 25%, rgba(59,130,246,0.2) 50%, rgba(6,182,212,0.2) 75%, rgba(34,197,94,0.2) 100%)'
})

const initial = computed(() => props.name?.charAt(0)?.toUpperCase() || '?')
const displayName = computed(() => props.name || t('circle.form.previewNamePlaceholder'))
const displaySlug = computed(() => props.slug || 'circle')
</script>

<style scoped>
/* 样式取自 CircleDetail.vue 的 .circle-header 区块（忠实复刻） */
.circle-header {
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 32px 24px;
  color: white;
  border-radius: 12px;
  overflow: hidden;
}

.header-overlay {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.circle-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.circle-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  object-fit: cover;
  flex-shrink: 0;
}

.circle-avatar-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: bold;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.circle-info {
  flex: 1;
  min-width: 0;
}

.circle-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.circle-name.is-placeholder {
  opacity: 0.6;
  font-weight: 500;
  font-style: italic;
}

.circle-slug {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
  font-weight: 400;
}
</style>
