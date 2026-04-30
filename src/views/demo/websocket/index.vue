<!--------------------------------
 - @Description: WebSocket 测试页面（使用全局唯一实例）
 - @Author: zuuuYao
 - @LastEditor: zuuuYao
 - @LastEditTime: 2025/09/09 15:31:02
 --------------------------------->
<template>
  <h2>WebSocket 连接测试</h2>
  <div class="websocket-demo">
    <!-- 顶部连接状态栏 -->
    <div class="top-bar">
      <div class="conn-info">
        <n-ellipsis class="conn-url">
          {{ wsStore.url || '未连接' }}
        </n-ellipsis>
        <span class="conn-status" :class="wsStore.connected ? 'connected' : 'disconnected'">
          {{ wsStore.connected ? '已连接' : '未连接' }}
        </span>
        <span class="conn-attempts">重连次数: {{ wsStore.reconnectAttempts }}</span>
      </div>
      <div class="conn-actions">
        <button :disabled="wsStore.connected" class="btn btn-primary" @click="wsStore.initializeConnect()">
          连接
        </button>
        <button :disabled="!wsStore.connected" class="btn btn-danger" @click="handleDisconnect">
          断开连接
        </button>
      </div>
    </div>

    <!-- 主体区域 -->
    <div class="main-content">
      <!-- 左侧操作区 -->
      <div class="sidebar">
        <div class="panel panel-subscribe">
          <h3>订阅主题</h3>
          <div class="form-group">
            <input
              v-model="subscribeTopic"
              type="text"
              placeholder="订阅主题"
              class="form-control"
            >
          </div>
          <button class="btn btn-success" @click="subscribe">
            订阅
          </button>
          <div v-if="wsStore.activeSubscriptions.length" class="subscriptions">
            <h4>当前订阅:</h4>
            <div v-for="dest in wsStore.activeSubscriptions" :key="dest" class="subscription-item">
              <n-ellipsis class="sub-dest">{{ dest }}</n-ellipsis>
              <button class="btn btn-sm btn-warning" @click="wsStore.unsubscribe(dest)">
                取消
              </button>
            </div>
          </div>
        </div>

        <div class="panel panel-send">
          <h3>发送消息</h3>
          <div class="form-group">
            <input
              v-model="sendDestination"
              type="text"
              placeholder="发送目的地主题"
              class="form-control"
            >
          </div>
          <div class="form-group">
            <textarea
              v-model="messageContent"
              placeholder="消息内容"
              class="form-control"
              rows="2"
            />
          </div>
          <button class="btn btn-primary" @click="sendMessage">
            发送
          </button>
        </div>
      </div>

      <!-- 右侧消息记录 -->
      <div class="panel panel-messages">
        <h3>消息记录</h3>
        <div class="message-area">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="message"
            :class="msg.type"
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
  </div>
</template>

<script setup>
import { useNotification } from 'naive-ui'
import { topic, useWebSocketStore } from '@/store/modules/websocket'

const notification = useNotification()
const wsStore = useWebSocketStore()

const subscribeTopic = ref(topic.testNotificationTopic)
const sendDestination = ref('/app/testNotificationsMessages')
const messageContent = ref('')
const messages = ref([])

function handleDisconnect() {
  wsStore.disconnect()
  addMessage('连接已断开', 'info')
}

function subscribe() {
  if (!wsStore.connected) {
    addMessage('请先建立连接', 'warning')
    return
  }

  wsStore.subscribe(subscribeTopic.value, (message) => {
    addMessage(message.body, 'received', null, subscribeTopic.value)
    notification.create({
      title: '收到一条通知',
      content: `${message.body}`,
      duration: 10000,
      closable: true,
    })
  })

  addMessage(`已订阅: ${subscribeTopic.value}`, 'info')
}

function sendMessage() {
  if (!wsStore.connected) {
    addMessage('请先建立连接', 'warning')
    return
  }

  if (!messageContent.value) {
    addMessage('请输入消息内容', 'warning')
    return
  }

  wsStore.send(sendDestination.value, {}, messageContent.value)
  addMessage(`发送到 ${sendDestination.value}: ${messageContent.value}`, 'sent')
  messageContent.value = ''
}

function addMessage(content, type, frame = null, destination = null) {
  messages.value.push({
    content,
    type,
    time: new Date().toLocaleTimeString(),
    frame,
    destination,
  })

  if (messages.value.length > 100) {
    messages.value.shift()
  }
}

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
</script>

<style scoped>
.websocket-demo {
  padding: 16px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ====== 顶部状态栏 ====== */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 12px 16px;
  background: #f9f9f9;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  gap: 12px;
  flex-wrap: wrap;
}

.conn-info {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  flex: 1;
  flex-wrap: wrap;
}

.conn-url {
  max-width: 360px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.conn-status {
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 10px;
}

.conn-status.connected {
  color: #fff;
  background: #28a745;
}

.conn-status.disconnected {
  color: #fff;
  background: #dc3545;
}

.conn-attempts {
  font-size: 13px;
  color: #888;
  flex-shrink: 0;
}

.conn-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* ====== 主体两栏 ====== */
.main-content {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 12px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

/* ====== 面板通用 ====== */
.panel {
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 16px;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel h3 {
  margin: 0 0 12px;
  color: #333;
  font-size: 15px;
  flex-shrink: 0;
}

.panel-messages {
  flex: 1;
  min-height: 0;
}

/* 订阅面板允许内部列表滚动，发送面板保持紧凑 */
.panel-subscribe {
  flex: 1;
  min-height: 0;
}

.panel-send {
  flex-shrink: 0;
}

/* ====== 表单控件 ====== */
.form-group {
  margin-bottom: 10px;
}

.form-control {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 13px;
  background: #fff;
}

textarea.form-control {
  resize: vertical;
}

/* ====== 按钮 ====== */
.btn {
  padding: 7px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.btn-primary {
  background-color: #2080f0;
  color: #fff;
}

.btn-success {
  background-color: #18a058;
  color: #fff;
}

.btn-danger {
  background-color: #d03050;
  color: #fff;
}

.btn-warning {
  background-color: #f0a020;
  color: #fff;
}

.btn-sm {
  padding: 3px 10px;
  font-size: 12px;
}

/* ====== 订阅列表 ====== */
.subscriptions {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #e5e5e5;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.subscriptions h4 {
  margin: 0 0 8px;
  font-size: 13px;
  color: #666;
}

.subscription-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 8px;
}

.sub-dest {
  font-size: 12px;
  color: #555;
  min-width: 0;
}

/* ====== 消息区域 ====== */
.message-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid #eee;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
}

.message {
  margin-bottom: 8px;
  padding: 8px 10px;
  border-radius: 4px;
  border-left: 4px solid #ccc;
  font-size: 13px;
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
  margin-bottom: 4px;
  font-size: 12px;
}

.message-time {
  color: #888;
}

.message-type {
  font-weight: 600;
}

.message-content {
  margin-bottom: 4px;
  word-break: break-all;
}

.message-destination {
  font-size: 11px;
  color: #999;
  word-break: break-all;
}

.no-messages {
  text-align: center;
  color: #bbb;
  padding: 40px 20px;
  font-size: 14px;
}

/* ====== 小屏适配 ====== */
@media (max-width: 768px) {
  .websocket-demo {
    height: auto;
  }

  .top-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .conn-info {
    gap: 8px;
  }

  .conn-url {
    max-width: 100%;
  }

  .main-content {
    grid-template-columns: 1fr;
  }

  .panel-messages {
    max-height: 50vh;
  }
}
</style>
