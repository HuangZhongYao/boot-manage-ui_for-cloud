<!--------------------------------
 - 订阅消息通知
 - Author    ZhongYao.Huang (https://github.com/HuangZhongYao)
 - Time      2025-09-14 0:41
 - Copyright © 2024 ZuuuuYao By Github
 --------------------------------->
<script setup>
import { useNotification } from 'naive-ui'
import { useUserStore } from '@/store/modules'
import { topic, webSocketService } from '@/utils/websocket/index'

const notification = useNotification()

const { userId } = useUserStore()

watch(() => webSocketService.connected.value, () => {
  // 订阅广播通知消息
  webSocketService.subscribe(topic.testNotificationTopic, (message) => {
    notification.create({
      title: '收到一条全体通知',
      content: `${message}`,
      duration: 10000,
      closable: true,
      onAfterEnter: () => {

      },
      onAfterLeave: () => {

      },
    })
  })
  // 订阅个人通知消息
  webSocketService.subscribe(`${topic.personalTopic.replace('{user}', userId)}`, (message) => {
    notification.create({
      title: '收到一条通知',
      content: `${message}`,
      duration: 10000,
      closable: true,
      onAfterEnter: () => {

      },
      onAfterLeave: () => {

      },
    })
  })
})
</script>

<template>
  <div style="display: none" />
</template>

<style scoped>

</style>
