import { defineStore } from 'pinia'
import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/store/index.js'

// 非响应式内部状态（模块级变量，避免 Pinia 深度代理 STOMP Client 实例）
let stompClient = null
let reconnectTimer = null
let manualDisconnect = false

// 订阅主题
export const topic = {
  testNotificationTopic: '/topic/testNotificationsMessages',
  notificationTopic: '/topic/notificationsMessages',
  personalTopic: '/user/{userId}/queue/messages',
}

// 消息发送目的地
export const app = {
  test: '/app/testNotificationsMessages',
}

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    url: '',
    connected: false,
    reconnectAttempts: 0,
    // 跟踪所有订阅，用于重连后自动恢复
    subscriptionCallbacks: [],
  }),

  getters: {
    isConnected: state => state.connected,
    activeSubscriptions: state => state.subscriptionCallbacks.map(s => s.destination),
  },

  actions: {
    /**
     * 初始化 WebSocket 连接（从 auth store 读取 token）
     */
    initializeConnect() {
      if (this.connected) return

      const endpoint = import.meta.env.VITE_WEBSOCKET_ENDPOINT
      if (!endpoint) {
        console.error('WebSocket 端点没有配置,初始化WebSocket连接失败')
        return
      }

      const authStore = useAuthStore()
      const { authHeaderKey, accessToken, tokenPrefix } = authStore
      if (!authHeaderKey) return

      const token = tokenPrefix + accessToken
      manualDisconnect = false
      this._createClient(
        `${endpoint}?token=abc123&${authHeaderKey}=${token}`,
        { [authHeaderKey]: token },
      )
    },

    /**
     * 直接连接（用于 demo 页面等需要自定义 URL 的场景）
     */
    connect(url, connectHeaders, onConnect, onError) {
      manualDisconnect = false
      this._createClient(url, connectHeaders, onConnect, onError)
    },

    /**
     * 断开 WebSocket 连接（不自动重连）
     */
    disconnect() {
      manualDisconnect = true
      clearTimeout(reconnectTimer)
      this.reconnectAttempts = 0
      this.url = ''

      if (stompClient) {
        stompClient.deactivate()
        stompClient = null
      }
      this.connected = false
    },

    /**
     * 订阅消息目的地（自动跟踪，重连后自动恢复）
     */
    subscribe(destination, callback) {
      const existing = this.subscriptionCallbacks.find(s => s.destination === destination)
      if (existing) {
        existing.callback = callback
      }
      else {
        this.subscriptionCallbacks.push({ destination, callback })
      }
      if (stompClient?.connected) {
        return stompClient.subscribe(destination, callback)
      }
      return null
    },

    /**
     * 取消订阅
     */
    unsubscribe(destination) {
      this.subscriptionCallbacks = this.subscriptionCallbacks.filter(
        s => s.destination !== destination,
      )
    },

    /**
     * 发送消息
     */
    send(destination, headers, body) {
      if (stompClient?.connected) {
        stompClient.publish({
          destination,
          headers,
          body: typeof body === 'string' ? body : JSON.stringify(body),
        })
      }
    },

    // --- 内部方法 ---

    _createClient(url, connectHeaders, onConnect, onError) {
      this.url = url
      if (stompClient) {
        stompClient.deactivate()
      }

      stompClient = new Client({
        brokerURL: url,
        connectHeaders,
        reconnectDelay: 0, // 禁用 STOMP.js 内置重连，自行控制以支持 token 刷新
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: (msg) => {
          if (import.meta.env.DEV) {
            console.warn('[STOMP]', msg)
          }
        },
        onConnect: (frame) => {
          this.connected = true
          this.reconnectAttempts = 0
          this._restoreSubscriptions()
          if (onConnect) {
            onConnect(frame)
          }
        },
        onDisconnect: () => {
          this.connected = false
          this._scheduleReconnect()
        },
        onStompError: (frame) => {
          console.error(`Broker reported error: ${frame.headers.message}`)
          console.error(`Additional details: ${frame.body}`)
          if (onError) {
            onError(frame)
          }
        },
      })

      stompClient.activate()
    },

    /**
     * 重连后恢复所有已跟踪的订阅
     */
    _restoreSubscriptions() {
      this.subscriptionCallbacks.forEach(({ destination, callback }) => {
        if (stompClient?.connected) {
          stompClient.subscribe(destination, callback)
        }
      })
    },

    /**
     * 指数退避重连：1s → 2s → 4s → 8s → 16s → 32s → 60s(max)
     */
    _scheduleReconnect() {
      if (manualDisconnect) {
        return
      }

      this.reconnectAttempts++
      if (this.reconnectAttempts > 10) {
        console.error('达到最大重连次数，停止重连')
        return
      }

      const delay = Math.min(1000 * (2 ** (this.reconnectAttempts - 1)), 60000)

      reconnectTimer = setTimeout(() => {
        this.initializeConnect()
      }, delay)
    },
  },
})
