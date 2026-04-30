<template>
  <div class="animated-bg-wrapper">
    <canvas ref="canvas" class="animated-bg"></canvas>
    <div class="gradient-overlay" :style="overlayStyle"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvas = ref(null)
let ctx = null
let particles = []
let animationId = null
let mouse = ref({ x: null, y: null, radius: 150 })

const overlayStyle = computed(() => {
  if (mouse.value.x !== null && mouse.value.y !== null) {
    return {
      background: `radial-gradient(circle 400px at ${mouse.value.x}px ${mouse.value.y}px, rgba(255,255,255,0.12), transparent 70%)`
    }
  }
  return { background: 'transparent' }
})

// 粒子类
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 0.8
    this.originalX = x
    this.originalY = y
    this.angle = Math.random() * Math.PI * 2
  }

  draw() {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.restore()
  }

  update() {
    // 鼠标交互效果
    if (mouse.value.x !== null && mouse.value.y !== null) {
      const dx = mouse.value.x - this.x
      const dy = mouse.value.y - this.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < mouse.value.radius) {
        const force = (mouse.value.radius - distance) / mouse.value.radius
        const angle = Math.atan2(dy, dx)

        this.x -= Math.cos(angle) * force * 2
        this.y -= Math.sin(angle) * force * 2
        this.alpha = Math.min(1, this.alpha + 0.05)
      } else {
        // 回到原位
        if (this.x !== this.originalX || this.y !== this.originalY) {
          const dx = this.originalX - this.x
          const dy = this.originalY - this.y
          this.x += dx * 0.05
          this.y += dy * 0.05
        }
        this.alpha = Math.max(0.3, this.alpha - 0.01)
      }
    }

    // 自然运动
    this.angle += 0.02
    this.x += Math.sin(this.angle) * 0.3
    this.y += Math.cos(this.angle) * 0.3

    this.draw()
  }
}

// 初始化粒子
const initParticles = () => {
  particles = []
  const colors = [
    'rgba(102, 126, 234, 0.8)',   // 蓝紫色
    'rgba(118, 75, 162, 0.8)',    // 紫色
    'rgba(237, 100, 166, 0.8)',   // 粉色
    'rgba(79, 172, 254, 0.8)',    // 天蓝色
    'rgba(0, 242, 254, 0.8)',     // 青色
    'rgba(67, 233, 123, 0.8)',    // 绿色
    'rgba(248, 177, 51, 0.8)',    // 橙色
    'rgba(255, 107, 107, 0.8)'    // 红色
  ]

  const numberOfParticles = 80

  for (let i = 0; i < numberOfParticles; i++) {
    const radius = Math.random() * 60 + 20
    const x = Math.random() * canvas.value.width
    const y = Math.random() * canvas.value.height
    const color = colors[Math.floor(Math.random() * colors.length)]
    const velocity = {
      x: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 0.5
    }
    particles.push(new Particle(x, y, radius, color, velocity))
  }
}

// 连接粒子
const connectParticles = () => {
  let opacityValue = 1
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x
      const dy = particles[a].y - particles[b].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 120) {
        opacityValue = 1 - (distance / 120)
        ctx.save()
        ctx.globalAlpha = opacityValue * 0.15
        ctx.strokeStyle = particles[a].color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(particles[a].x, particles[a].y)
        ctx.lineTo(particles[b].x, particles[b].y)
        ctx.stroke()
        ctx.restore()
      }
    }
  }
}

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate)
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  particles.forEach(particle => {
    particle.update()
  })

  connectParticles()
}

// 调整画布大小
const resizeCanvas = () => {
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
  initParticles()
}

// 鼠标移动事件
const handleMouseMove = (e) => {
  mouse.value = { ...mouse.value, x: e.x, y: e.y }
}

const handleMouseLeave = () => {
  mouse.value = { ...mouse.value, x: null, y: null }
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  resizeCanvas()
  animate()

  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseout', handleMouseLeave)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseout', handleMouseLeave)
})
</script>

<style scoped>
.animated-bg-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.animated-bg {
  position: absolute;
  top: -40px;
  left: -40px;
  width: calc(100% + 80px);
  height: calc(100% + 80px);
  filter: blur(30px) saturate(1.6) brightness(0.9);
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  mix-blend-mode: soft-light;
  transition: background 0.3s ease;
}
</style>
