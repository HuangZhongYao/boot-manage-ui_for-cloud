// 导入SockJS库，用于创建WebSocket连接的备选传输方式
import SockJS from 'sockjs-client'
// 导入STOMP.js库，用于处理STOMP协议的消息通信
import { Client } from '@stomp/stompjs'

/**
 * WebSocket服务类，用于管理基于STOMP协议的WebSocket连接。
 * 提供连接、断开、订阅、取消订阅和发送消息等功能。
 */
class WebSocketService {
  /**
   * 构造函数，初始化WebSocket服务实例
   */
  constructor() {
    // STOMP客户端实例
    this.stompClient = null
    // 连接状态标识
    this.connected = false
    // 订阅映射表，存储所有活动的订阅
    this.subscriptions = new Map()
    // 重连尝试次数计数器
    this.reconnectAttempts = 0
    // 最大重连尝试次数限制
    this.maxReconnectAttempts = 5
    // 重连延迟时间（毫秒）
    this.reconnectDelay = 5000
  }

  /**
   * 连接到WebSocket服务器。
   * @param {string} url - WebSocket服务器地址。
   * @param {Function} onConnectCallback - 连接成功时的回调函数。
   * @param {Function} onErrorCallback - 发生错误时的回调函数。
   */
  connect(url, onConnectCallback, onErrorCallback) {
    try {
      // 创建SockJS连接，提供WebSocket的备选传输方式
      const socket = new SockJS(url)

      // 创建STOMP客户端
      this.stompClient = new Client({
        // WebSocket工厂函数，返回SockJS实例
        webSocketFactory: () => socket,
        // 重连延迟时间，设置为5000毫秒
        reconnectDelay: 5000,
        // 接收心跳检测间隔，设置为4000毫秒
        heartbeatIncoming: 4000,
        // 发送心跳检测间隔，设置为4000毫秒
        heartbeatOutgoing: 4000,
        // 连接成功回调函数
        onConnect: (frame) => {
          // 输出连接成功的日志信息
          console.warn(`Connected: ${frame}`)
          // 设置连接状态为已连接
          this.connected = true
          // 重置重连尝试次数
          this.reconnectAttempts = 0
          // 如果提供了连接成功回调函数，则执行它
          if (onConnectCallback) {
            onConnectCallback(frame)
          }
        },
        // 连接断开回调函数
        onDisconnect: () => {
          // 输出断开连接的日志信息
          console.warn('Disconnected')
          // 设置连接状态为未连接
          this.connected = false
        },
        // STOMP错误回调函数
        onStompError: (frame) => {
          // 输出代理报告的错误信息
          console.error(`Broker reported error: ${frame.headers.message}`)
          // 输出错误的详细信息
          console.error(`Additional details: ${frame.body}`)
          // 如果提供了错误回调函数，则执行它
          if (onErrorCallback) {
            onErrorCallback(frame)
          }
        },
      })

      // 激活STOMP客户端，开始连接过程
      this.stompClient.activate()
    }
    // 捕获连接过程中可能发生的错误
    catch (error) {
      // 输出WebSocket连接错误日志
      console.error('WebSocket连接错误:', error)
      // 如果提供了错误回调函数，则执行它
      if (onErrorCallback) {
        onErrorCallback(error)
      }
    }
  }

  /**
   * 断开当前WebSocket连接。
   */
  disconnect() {
    // 检查STOMP客户端是否存在
    if (this.stompClient) {
      // 停用STOMP客户端，断开连接
      this.stompClient.deactivate()
      // 设置连接状态为未连接
      this.connected = false
      // 清空所有订阅
      this.subscriptions.clear()
    }
  }

  /**
   * 订阅指定的消息目的地。
   * @param {string} destination - 消息目的地路径。
   * @param {Function} callback - 接收消息时的回调函数。
   * @returns {Object|null} 返回订阅对象或null（如果未连接）。
   */
  subscribe(destination, callback) {
    // 检查STOMP客户端是否存在且已连接
    if (this.stompClient && this.stompClient.connected) {
      // 订阅指定目的地的消息
      const subscription = this.stompClient.subscribe(destination, callback)
      // 将订阅添加到订阅映射表中
      this.subscriptions.set(destination, subscription)
      // 返回订阅对象
      return subscription
    }
    // 如果未连接，返回null
    return null
  }

  /**
   * 取消对指定消息目的地的订阅。
   * @param {string} destination - 要取消订阅的消息目的地路径。
   */
  unsubscribe(destination) {
    // 从订阅映射表中获取指定目的地的订阅
    const subscription = this.subscriptions.get(destination)
    // 检查订阅是否存在
    if (subscription) {
      // 取消订阅
      subscription.unsubscribe()
      // 从订阅映射表中删除该订阅
      this.subscriptions.delete(destination)
    }
  }

  /**
   * 向指定目的地发送消息。
   * @param {string} destination - 消息发送的目的地路径。
   * @param {Object} headers - 消息头信息。
   * @param {Object|string} body - 消息体内容。
   */
  send(destination, headers, body) {
    // 检查STOMP客户端是否存在且已连接
    if (this.stompClient && this.stompClient.connected) {
      // 发布消息到指定目的地
      this.stompClient.publish({
        // 消息目的地
        destination,
        // 消息头
        headers,
        // 消息体，如果是字符串则直接使用，否则转换为JSON字符串
        body: typeof body === 'string' ? body : JSON.stringify(body),
      })
    }
  }

  /**
   * 检查当前是否已连接到WebSocket服务器。
   * @returns {boolean} 如果已连接返回true，否则返回false。
   */
  isConnected() {
    // 返回连接状态：connected为true，stompClient存在，且stompClient.connected为true
    return this.connected && this.stompClient && this.stompClient.connected
  }
}

// 创建WebSocketService的单例实例
const webSocketService = new WebSocketService()
// 导出WebSocket服务实例
export default webSocketService
