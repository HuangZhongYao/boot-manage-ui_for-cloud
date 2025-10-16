<!--------------------------------
 - @Author: zuuuYao
 - @LastEditor: zuuuYao
 - @LastEditTime: 2025/10/15 15:54
 --------------------------------->
<script setup lang="ts">
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
        <i class="i-fe:bell hover:cursor-pointer" />
      </n-badge>
    </template>
    消息通知
  </n-tooltip>
  <!-- 通知详情抽屉 -->
  <n-drawer v-model:show="showMyNotice" width="50vh" close-on-esc placement="right" resizable>
    <n-drawer-content closable>
      <template #header>
        <div class="flex items-center">
          <i class="i-fe:bell" />
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

</style>
