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
        <NImage
          v-for="(img, idx) in images"
          :key="idx"
          :src="img"
          :alt="`图片 ${idx + 1}`"
          object-fit="contain"
          :width="containerWidth"
          :height="containerHeight"
          :style="{ borderRadius: '8px' }"
        />
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
// 每张图自然尺寸 idx -> { width, height }，用于按真实宽高比缩放
const imageSizes = ref({})

// 预读每张图自然尺寸，用于按真实宽高比缩放
const loadImageSizes = (imgs) => {
  imgs.forEach((src, idx) => {
    const img = new Image()
    img.onload = () => {
      imageSizes.value = {
        ...imageSizes.value,
        [idx]: { width: img.naturalWidth, height: img.naturalHeight }
      }
    }
    img.src = src
  })
}

watch(() => props.images, (imgs) => {
  currentIndex.value = 0
  imageSizes.value = {}
  loadImageSizes(imgs)
}, { immediate: true })

const containerWidth = computed(() => Math.round(props.parentWidth * props.widthRatio))
// 上限高度：保持原有 heightRatio 语义，轮播框绝不会比之前更高
const maxContainerHeight = computed(() => Math.round(containerWidth.value * props.heightRatio))

// 当前图的真实宽高比
const currentAspect = computed(() => {
  const size = imageSizes.value[currentIndex.value]
  if (!size || !size.width || !size.height) return null
  return size.width / size.height
})

// 智能缩放：框宽固定，高度跟随当前图宽高比，但不超过上限。
// 配合 object-fit:contain，完整显示图像并尽量填满框。
const containerHeight = computed(() => {
  const aspect = currentAspect.value
  if (!aspect) return maxContainerHeight.value
  const fitted = containerWidth.value / aspect
  const floor = Math.round(containerWidth.value * 0.2) // 防止超宽图压成细缝
  return Math.max(floor, Math.min(maxContainerHeight.value, fitted))
})

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
}

.carousel-track {
  display: flex;
  transition: transform 0.35s ease;
}

.carousel-viewport :deep(img) {
  display: block;
  border-radius: 8px;
  object-fit: contain;
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
