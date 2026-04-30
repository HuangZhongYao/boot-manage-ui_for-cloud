<!--------------------------------
 - 订阅消息通知
 - Author    ZhongYao.Huang (https://github.com/HuangZhongYao)
 - Time      2025-09-14 0:41
 - Copyright © 2024 ZuuuuYao By Github
 --------------------------------->
<script setup>
import { useNotification } from 'naive-ui'
import { useUserStore } from '@/store/modules'
import { topic, useWebSocketStore } from '@/store/modules/websocket'

const notification = useNotification()
const { userId } = useUserStore()
const wsStore = useWebSocketStore()

onMounted(() => {
  wsStore.initializeConnect()

  // 订阅个人通知消息
  wsStore.subscribe(
    topic.personalTopic.replace('{userId}', userId),
    (message) => {
      console.error('收到一条通知', message.body)
      notification.create({
        title: '收到一条通知',
        content: `${message}`,
        duration: 10000,
        closable: true,
      })
    },
  )

  // 订阅广播通知消息
  wsStore.subscribe(topic.notificationTopic, (message) => {
    console.error('收到一条全体通知', message.body)
    notification.create({
      title: '收到一条全体通知',
      content: `${message}`,
      duration: 10000,
      closable: true,
    })
  })
})
</script>

<template>
  <div style="display: none" />
</template>

<style scoped>

</style>
