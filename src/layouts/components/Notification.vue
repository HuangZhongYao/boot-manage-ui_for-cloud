<!--------------------------------
 - @Author: zuuuYao
 - @LastEditor: zuuuYao
 - @LastEditTime: 2025/10/15 15:54
 --------------------------------->
<script setup>
import { onMounted, ref } from 'vue'
import MyNotice from '@/views/notice/my-notice/index.vue'
import api from '@/views/notice/my-notice/api'

// 控制通知抽屉显示状态的响应式变量
const showMyNotice = ref(false)
// 未读通知数量的响应式变量
const notificationsRecordCount = ref(0)

// 组件挂载时获取未读通知数量
onMounted(() => {
  api.countUnreadNotifications().then((res) => {
    notificationsRecordCount.value = res.result
  })
})
</script>

<template>
  <!-- 消息通知提示工具 -->
  <n-tooltip trigger="hover">
    <template #trigger>
      <!-- 带未读数量徽标的铃铛图标 -->
      <n-badge class="mr-16" size="small" :value="notificationsRecordCount" :max="99" processing @click="showMyNotice = !showMyNotice">
        <i class="icon-ld i-fe:bell hover:cursor-pointer" />
      </n-badge>
    </template>
    消息通知
  </n-tooltip>
  <!-- 通知详情抽屉 -->
  <n-drawer v-model:show="showMyNotice" width="50vh" close-on-esc placement="right" resizable>
    <n-drawer-content closable>
      <template #header>
        <div class="flex items-center">
          <i class="icon-ld i-fe:bell" />
          <span class="ml-1vh">我的通知</span>
          <!-- 显示通知总数的标签 -->
          <n-tag type="info" round size="small" :bordered="false" class="ml-1vh font-size-1vh">
            共 {{ notificationsRecordCount }} 条
          </n-tag>
        </div>
      </template>
      <!-- 嵌入的通知内容组件 -->
      <MyNotice />
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
.icon-ld:hover {
  /*原点位于元素的水平中心（center）和垂直顶部（top）位置*/
  transform-origin: center top;
  /* 0.3 秒内 匀速完成 2 次动画 */
  animation: left-Right-shaking 0.3s linear 2;
}
/*左右摇摆关键帧动画*/
@keyframes left-Right-shaking {
  0% {
    transform: rotate(0deg);
  }
  1% {
    transform: rotate(1deg);
  }
  2% {
    transform: rotate(2deg);
  }
  3% {
    transform: rotate(3deg);
  }
  4% {
    transform: rotate(4deg);
  }
  5% {
    transform: rotate(5deg);
  }
  6% {
    transform: rotate(6deg);
  }
  7% {
    transform: rotate(7deg);
  }
  8% {
    transform: rotate(8deg);
  }
  9% {
    transform: rotate(9deg);
  }
  10% {
    transform: rotate(10deg);
  }
  11% {
    transform: rotate(11deg);
  }
  12% {
    transform: rotate(12deg);
  }
  13% {
    transform: rotate(13deg);
  }
  14% {
    transform: rotate(14deg);
  }
  15% {
    transform: rotate(15deg);
  }
  16% {
    transform: rotate(16deg);
  }
  17% {
    transform: rotate(17deg);
  }
  18% {
    transform: rotate(18deg);
  }
  19% {
    transform: rotate(19deg);
  }
  20% {
    transform: rotate(20deg);
  }
  21% {
    transform: rotate(21deg);
  }
  22% {
    transform: rotate(22deg);
  }
  23% {
    transform: rotate(23deg);
  }
  24% {
    transform: rotate(24deg);
  }
  25% {
    transform: rotate(25deg);
  }
  26% {
    transform: rotate(24deg);
  }
  27% {
    transform: rotate(23deg);
  }
  28% {
    transform: rotate(22deg);
  }
  29% {
    transform: rotate(21deg);
  }
  30% {
    transform: rotate(20deg);
  }
  31% {
    transform: rotate(19deg);
  }
  32% {
    transform: rotate(18deg);
  }
  33% {
    transform: rotate(17deg);
  }
  34% {
    transform: rotate(16deg);
  }
  35% {
    transform: rotate(15deg);
  }
  36% {
    transform: rotate(14deg);
  }
  37% {
    transform: rotate(13deg);
  }
  38% {
    transform: rotate(12deg);
  }
  39% {
    transform: rotate(11deg);
  }
  40% {
    transform: rotate(10deg);
  }
  41% {
    transform: rotate(9deg);
  }
  42% {
    transform: rotate(8deg);
  }
  43% {
    transform: rotate(7deg);
  }
  44% {
    transform: rotate(6deg);
  }
  45% {
    transform: rotate(5deg);
  }
  46% {
    transform: rotate(4deg);
  }
  47% {
    transform: rotate(3deg);
  }
  48% {
    transform: rotate(2deg);
  }
  49% {
    transform: rotate(1deg);
  }
  50% {
    transform: rotate(0deg);
  }
  51% {
    transform: rotate(-1deg);
  }
  52% {
    transform: rotate(-2deg);
  }
  53% {
    transform: rotate(-3deg);
  }
  54% {
    transform: rotate(-4deg);
  }
  55% {
    transform: rotate(-5deg);
  }
  56% {
    transform: rotate(-6deg);
  }
  57% {
    transform: rotate(-7deg);
  }
  58% {
    transform: rotate(-8deg);
  }
  59% {
    transform: rotate(-9deg);
  }
  60% {
    transform: rotate(-10deg);
  }
  61% {
    transform: rotate(-11deg);
  }
  62% {
    transform: rotate(-12deg);
  }
  63% {
    transform: rotate(-13deg);
  }
  64% {
    transform: rotate(-14deg);
  }
  65% {
    transform: rotate(-15deg);
  }
  66% {
    transform: rotate(-16deg);
  }
  67% {
    transform: rotate(-17deg);
  }
  68% {
    transform: rotate(-18deg);
  }
  69% {
    transform: rotate(-19deg);
  }
  70% {
    transform: rotate(-20deg);
  }
  71% {
    transform: rotate(-21deg);
  }
  72% {
    transform: rotate(-22deg);
  }
  73% {
    transform: rotate(-23deg);
  }
  74% {
    transform: rotate(-24deg);
  }
  75% {
    transform: rotate(-25deg);
  }
  76% {
    transform: rotate(-24deg);
  }
  77% {
    transform: rotate(-23deg);
  }
  78% {
    transform: rotate(-22deg);
  }
  79% {
    transform: rotate(-21deg);
  }
  80% {
    transform: rotate(-20deg);
  }
  81% {
    transform: rotate(-19deg);
  }
  82% {
    transform: rotate(-18deg);
  }
  83% {
    transform: rotate(-17deg);
  }
  84% {
    transform: rotate(-16deg);
  }
  85% {
    transform: rotate(-15deg);
  }
  86% {
    transform: rotate(-14deg);
  }
  87% {
    transform: rotate(-13deg);
  }
  88% {
    transform: rotate(-12deg);
  }
  89% {
    transform: rotate(-11deg);
  }
  90% {
    transform: rotate(-10deg);
  }
  91% {
    transform: rotate(-9deg);
  }
  92% {
    transform: rotate(-8deg);
  }
  93% {
    transform: rotate(-7deg);
  }
  94% {
    transform: rotate(-6deg);
  }
  95% {
    transform: rotate(-5deg);
  }
  96% {
    transform: rotate(-4deg);
  }
  97% {
    transform: rotate(-3deg);
  }
  98% {
    transform: rotate(-2deg);
  }
  99% {
    transform: rotate(-1deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
</style>
