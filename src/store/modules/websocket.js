import { defineStore } from 'pinia'
import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/store/index.js'

// 非响应式内部状态（模块级变量，避免 Pinia 深度代理 STOMP Client 实例）
let stompClient = null
let reconnectTimer = null
let manualDisconnect = false
// 正在建立连接（STOMP CONNECTED 帧到达前）的标志，
// 防止 onMounted / 路由守卫等多次调用 initializeConnect 竞态重复创建 Client
let connecting = false

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
      // 已连接 或 正在连接 时直接返回，避免重复创建 Client
      if (this.connected || connecting) return

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
      connecting = true
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
      connecting = true
      this._createClient(url, connectHeaders, onConnect, onError)
    },

    /**
     * 断开 WebSocket 连接（不自动重连）
     */
    disconnect() {
      manualDisconnect = true
      connecting = false
      clearTimeout(reconnectTimer)
      reconnectTimer = null
      this.reconnectAttempts = 0
      this.url = ''

      if (stompClient) {
        // 先摘掉回调，防止优雅断开（deactivate）触发 onDisconnect → 重连逻辑
        stompClient.onDisconnect = () => {}
        stompClient.onWebSocketClose = () => {}
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
      // 替换旧连接：先摘掉旧 client 的全部回调再异步关闭，
      // 避免旧连接的 onDisconnect / onWebSocketClose 触发 _scheduleReconnect，
      // 造成“创建新连接 → 旧连接断开 → 再创建新连接”的级联
      if (stompClient) {
        const old = stompClient
        old.onDisconnect = () => {}
        old.onWebSocketClose = () => {}
        old.onWebSocketError = () => {}
        old.deactivate()
        stompClient = null
      }

      try {
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
            connecting = false
            this.reconnectAttempts = 0
            this._restoreSubscriptions()
            if (onConnect) {
              onConnect(frame)
            }
          },
          onDisconnect: () => {
            this.connected = false
            connecting = false
            this._scheduleReconnect()
          },
          // 关键修复：网络异常断开（断网/服务器重启/心跳丢失等）时，
          // STOMP.js 不会触发 onDisconnect，而是触发 onWebSocketClose，
          // 必须在这里安排重连
          onWebSocketClose: () => {
            this.connected = false
            connecting = false
            this._scheduleReconnect()
          },
          onWebSocketError: () => {
            // error 之后通常紧跟 close，重连逻辑统一放在 onWebSocketClose 中
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
      }
      catch (error) {
        // 创建/激活失败时复位标志，允许后续重试
        connecting = false
        stompClient = null
        console.error('WebSocket 连接创建失败:', error)
      }
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
      if (manualDisconnect || reconnectTimer) {
        return
      }

      this.reconnectAttempts++
      if (this.reconnectAttempts > 20) {
        console.error('达到最大重连次数，停止重连')
        return
      }

      const delay = Math.min(1000 * (2 ** (this.reconnectAttempts - 1)), 60000)

      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        this.initializeConnect()
      }, delay)
    },
  },
})
