<template>
  <div class="image-carousel" :style="{ marginTop: '25px' }">
    <div
      class="carousel-viewport"
      :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }"
    >
      <div
        class="carousel-track"
        :style="{ transform: `translateX(-${currentIndex * containerWidth}px)` }"
      >
        <!-- 每张图独立 slide：flex 基准锁死为 containerWidth 且禁止伸缩，
             slide 占位与图片自然尺寸/比例完全解耦，translateX(index*width) 永不错位，
             彻底杜绝相邻图片漏边。图片在 slide 内 100% 填充并 contain 居中。 -->
        <div
          v-for="(img, idx) in images"
          :key="idx"
          class="carousel-slide"
          :style="{
            width: containerWidth + 'px',
            height: containerHeight + 'px',
            flexBasis: containerWidth + 'px',
            flexShrink: 0,
            flexGrow: 0
          }"
        >
          <NImage
            :src="img"
            :alt="`图片 ${idx + 1}`"
            object-fit="contain"
            :width="containerWidth"
            :height="containerHeight"
          />
        </div>
      </div>

      <template v-if="images.length > 1">
        <button class="carousel-arrow left" :style="arrowStyle" @click.stop="prev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :width="iconSize" :height="iconSize">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="carousel-arrow right" :style="arrowStyle" @click.stop="next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :width="iconSize" :height="iconSize">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <div class="carousel-dots" :style="dotsStyle">
          <span
            v-for="(_, idx) in images"
            :key="idx"
            class="dot"
            :class="{ active: idx === currentIndex }"
            :style="dotStyle"
            @click.stop="goTo(idx)"
          ></span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { NImage } from 'naive-ui'

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  },
  parentWidth: {
    type: Number,
    default: 600
  },
  widthRatio: {
    type: Number,
    default: 0.75
  },
  heightRatio: {
    type: Number,
    default: 0.6
  }
})

const currentIndex = ref(0)

// 切换图片组时回到第一张
watch(() => props.images, () => {
  currentIndex.value = 0
})

// 固定整体尺寸：宽度按父宽比例，高度按宽高比。
// 轮播框大小恒定，不随图片内容变化，配合 object-fit:contain 完整展示图片，
// 留白区域由渐变背景填充，从而清晰区分轮播区域。
const containerWidth = computed(() => Math.round(props.parentWidth * props.widthRatio))
const containerHeight = computed(() => Math.round(containerWidth.value * props.heightRatio))

const iconSize = computed(() => Math.max(14, Math.round(containerWidth.value / 20)))
const arrowSize = computed(() => iconSize.value + 14)

const arrowStyle = computed(() => ({
  width: arrowSize.value + 'px',
  height: arrowSize.value + 'px',
  top: `calc(50% - ${arrowSize.value / 2}px)`
}))

const dotSize = computed(() => Math.max(5, Math.round(containerWidth.value / 80)))
const dotsStyle = computed(() => ({
  bottom: Math.round(containerHeight.value * 0.04) + 'px'
}))
const dotStyle = computed(() => ({
  width: dotSize.value + 'px',
  height: dotSize.value + 'px'
}))

const prev = () => {
  currentIndex.value = currentIndex.value > 0
    ? currentIndex.value - 1
    : props.images.length - 1
}

const next = () => {
  currentIndex.value = currentIndex.value < props.images.length - 1
    ? currentIndex.value + 1
    : 0
}

const goTo = (idx) => {
  currentIndex.value = idx
}
</script>

<style scoped>
.image-carousel {
  position: relative;
  display: flex;
  justify-content: left;
}

.carousel-viewport {
  position: relative;
  overflow: hidden;
  line-height: 0;
  flex-shrink: 0;
  border-radius: 8px;
  /* 默认渐变背景：与周围卡片区分、突出轮播区域，
     object-fit:contain 产生的留白也由此渐变填充。
     深色底沿用全局变量保证图片为视觉焦点，光晕用项目主题绿
     (#66eac2 薄荷 / #22b36a 深绿，即 --primary-gradient 的两端)，
     与 --theme-color 主题色保持一致。 */
  background:
    radial-gradient(ellipse at top left, rgba(105, 245, 203, 0.201), transparent 55%),
    radial-gradient(ellipse at bottom right, rgba(17, 214, 142, 0.288), transparent 55%),
    linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
  border: 1px solid var(--glass-border);
}

.carousel-track {
  display: flex;
  transition: transform 0.35s ease;
}


.carousel-arrow {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: rgba(0, 0, 0, 0.45);
  border: none;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
  z-index: 2;
}

.carousel-arrow:hover {
  background: rgba(0, 0, 0, 0.65);
}

.carousel-arrow.left {
  left: 6px;
}

.carousel-arrow.right {
  right: 6px;
}

.image-carousel:hover .carousel-arrow {
  opacity: 1;
}

.carousel-dots {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 2;
  padding: 4px 8px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.4);
}

.dot {
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.dot.active {
  background: #fff;
  transform: scale(1.3);
}

.dot:hover {
  background: rgba(255, 255, 255, 0.7);
}
</style>
