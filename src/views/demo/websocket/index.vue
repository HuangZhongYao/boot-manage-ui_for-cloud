<!--------------------------------
 - @Description: WebSocket 测试页面
 - @Author: zuuuYao
 - @LastEditor: zuuuYao
 - @LastEditTime: 2025/09/09 15:31:02
 --------------------------------->
<template>
  <h2>WebSocket 连接测试</h2>
  <div class="websocket-demo">

    <!-- 连接控制 -->
    <div class="panel">
      <h3>连接设置</h3>
      <div class="form-group">
        <label>WebSocket地址:</label>
        <input
          v-model="websocketUrl"
          type="text"
          placeholder="输入WebSocket地址"
          class="form-control"
        >
      </div>
      <div class="button-group">
        <button
          :disabled="isConnected || connecting"
          class="btn btn-primary"
          @click="connect"
        >
          {{ connecting ? '连接中...' : '连接' }}
        </button>
        <button
          :disabled="!isConnected"
          class="btn btn-danger"
          @click="disconnect"
        >
          断开连接
        </button>
      </div>
      <div class="status">
        状态:
        <span :class="isConnected ? 'status-connected' : 'status-disconnected'">
          {{ isConnected ? '已连接' : '未连接' }}
        </span>
      </div>
    </div>

    <!-- 消息订阅 -->
    <div class="panel">
      <h3>订阅消息</h3>
      <div class="form-group">
        <label>订阅主题:</label>
        <input
          v-model="subscribeTopic"
          type="text"
          placeholder="输入订阅主题"
          class="form-control"
        >
      </div>
      <button class="btn btn-success" @click="subscribe">
        订阅
      </button>
      <div  class="subscriptions">
        <h4>当前订阅:</h4>
        <div
          v-for="sub in activeSubscriptions"
          :key="sub.destination"
          class="subscription-item"
        >
          {{ sub.destination }}
          <button
            class="btn btn-sm btn-warning"
            @click="unsubscribe(sub.destination)"
          >
            取消订阅
          </button>
        </div>
      </div>
    </div>

    <!-- 发送消息 -->
    <div class="panel">
      <h3>发送消息</h3>
      <div class="form-group">
        <label>发送目的地:</label>
        <input
          v-model="sendDestination"
          type="text"
          placeholder="输入发送目的地"
          class="form-control"
        >
      </div>
      <div class="form-group">
        <label>消息内容:</label>
        <textarea
          v-model="messageContent"
          placeholder="输入消息内容"
          class="form-control"
          rows="3"
        />
      </div>
      <button class="btn btn-primary" @click="sendMessage">
        发送消息
      </button>
    </div>

    <!-- 消息显示 -->
    <div class="panel">
      <h3>消息记录</h3>
      <div class="message-area">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="message" :class="[msg.type]"
        >
          <div class="message-header">
            <span class="message-time">[{{ msg.time }}]</span>
            <span class="message-type">{{ getMessageTypeText(msg.type) }}</span>
          </div>
          <div class="message-content">
            {{ msg.content }}
          </div>
          <div v-if="msg.destination" class="message-destination">
            主题: {{ msg.destination }}
          </div>
        </div>
        <div v-if="messages.length === 0" class="no-messages">
          暂无消息
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onUnmounted, ref } from 'vue'
import { webSocketService } from '@/utils/websocket/index.js'
import { useAuthStore } from '@/store'
// 响应式数据
// const websocketUrl = ref('http://localhost:8260/ws') // 直连方式
// const websocketUrl = ref('http://localhost:8180/bm-websocket/ws') // 网关方式
const websocketUrl = ref(`/api/bm-websocket/ws`) // 前端 /api 代理
const connecting = ref() // 连接中状态
const isConnected = ref(webSocketService.isConnected()) // 连接状态
const isSubscribe = ref(false) // 订阅状态
const subscribeTopic = ref('/topic/testNotificationsMessages') // 订阅主题
const sendDestination = ref('/app/testNotificationsMessages') // 发送目的地
const messageContent = ref('')
const messages = ref([])
const activeSubscriptions = ref([])
const authStore = useAuthStore()
// 使用Auth Store获取访问令牌
const { authHeaderKey, accessToken, tokenPrefix } = authStore
// 连接WebSocket
function connect() {
  connecting.value = true

  webSocketService.connect(
    `${websocketUrl.value}?token=abc123&${authHeaderKey}=${tokenPrefix + accessToken}`,
    (frame) => {
      connecting.value = false
      isConnected.value = true
      addMessage('连接成功', 'info', frame)
    },
    (error) => {
      connecting.value = false
      isConnected.value = false
      addMessage(`连接失败: ${error.message || error}`, 'error')
    },
  )
}

// 断开连接
function disconnect() {
  webSocketService.disconnect()
  isConnected.value = false
  activeSubscriptions.value = []
  addMessage('连接已断开', 'info')
}

// 订阅消息
function subscribe() {
  if (!isConnected.value) {
    addMessage('请先建立连接', 'warning')
    return
  }

  const subscription = webSocketService.subscribe(subscribeTopic.value, (message) => {
    addMessage(message.body, 'received', null, subscribeTopic.value)
  })

  if (subscription) {
    activeSubscriptions.value.push({
      destination: subscribeTopic.value,
      subscription,
    })
    isSubscribe.value = true
    addMessage(`已订阅: ${subscribeTopic.value}`, 'info')
  }
}

// 取消订阅
function unsubscribe(destination) {
  webSocketService.unsubscribe(destination)
  activeSubscriptions.value = activeSubscriptions.value.filter(
    sub => sub.destination !== destination,
  )
  isSubscribe.value = false
  addMessage(`已取消订阅: ${destination}`, 'info')
}

// 发送消息
function sendMessage() {
  if (!isConnected.value) {
    addMessage('请先建立连接', 'warning')
    return
  }
  if (!isSubscribe.value) {
    addMessage('请先订阅主题', 'warning')
    return
  }

  if (!messageContent.value) {
    addMessage('请输入消息内容', 'warning')
    return
  }

  webSocketService.send(sendDestination.value, {}, messageContent.value)
  addMessage(`发送消息到 ${sendDestination.value}: ${messageContent.value}`, 'sent')
  messageContent.value = ''
}

// 添加消息到显示区域
function addMessage(content, type, frame = null, destination = null) {
  messages.value.push({
    content,
    type,
    time: new Date().toLocaleTimeString(),
    frame,
    destination,
  })

  // 限制消息数量，避免内存泄漏
  if (messages.value.length > 100) {
    messages.value.shift()
  }
}

// 获取消息类型文本
function getMessageTypeText(type) {
  const typeMap = {
    info: '信息',
    error: '错误',
    warning: '警告',
    sent: '发送',
    received: '接收',
  }
  return typeMap[type] || type
}

// 组件卸载时断开连接
onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.websocket-demo {
  padding: 20px;
  font-family: Arial, sans-serif;
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  gap: 20px; /* 设置间距 */
  justify-content: flex-start; /* 左对齐 */
}

.panel {
  width: 300px;
  height: 100vh;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
  overflow-y: auto;
}

.panel h3 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.button-group {
  margin: 15px 0;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
  padding: 4px 8px;
  font-size: 12px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.status {
  margin-top: 10px;
  font-weight: bold;
}

.status-connected {
  color: #28a745;
}

.status-disconnected {
  color: #dc3545;
}

.subscriptions {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.subscription-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.message-area {
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  border: 1px solid #eee;
  padding: 10px;
  background-color: white;
}

.message {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
  border-left: 4px solid #ccc;
}

.message.info {
  background-color: #d1ecf1;
  border-left-color: #0c5460;
}

.message.error {
  background-color: #f8d7da;
  border-left-color: #721c24;
}

.message.warning {
  background-color: #fff3cd;
  border-left-color: #856404;
}

.message.sent {
  background-color: #cce5ff;
  border-left-color: #004085;
}

.message.received {
  background-color: #d4edda;
  border-left-color: #155724;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 12px;
}

.message-time {
  color: #666;
}

.message-type {
  font-weight: bold;
}

.message-content {
  margin-bottom: 5px;
}

.message-destination {
  font-size: 12px;
  color: #666;
}

.no-messages {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px;
}
</style>
