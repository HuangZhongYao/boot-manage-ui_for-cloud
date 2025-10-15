<!--------------------------------
 - @Author: zuuuYao
 - @LastEditor: zuuuYao
 - @LastEditTime: 2025/10/15 15:54
 --------------------------------->
<script setup lang="ts">
import MyNotice from '@/views/notice/my-notice/index.vue'

const showMyNotice = ref(false)
const notificationsRecordCount = ref(0)
</script>

<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <n-badge class="mr-16" size="small" :value="notificationsRecordCount" :max="99" processing @click="showMyNotice = !showMyNotice">
        <i class="i-fe:bell hover:cursor-pointer" />
      </n-badge>
    </template>
    消息通知
  </n-tooltip>
  <n-drawer v-model:show="showMyNotice" width="50vh" close-on-esc placement="right" resizable>
    <n-drawer-content closable>
      <template #header>
        <div class="flex items-center">
          <i class="i-fe:bell" />
          <span class="ml-1vh">我的通知</span>
          <n-tag type="info" round size="small" bordered="false" class="ml-1vh font-size-1vh">
            共 {{ notificationsRecordCount }} 条
          </n-tag>
        </div>
      </template>
      <MyNotice @update="(val) => notificationsRecordCount = val " />
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>

</style>
