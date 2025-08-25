/**********************************
 * @FilePath: interceptors.js
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/04 22:46:40
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { resolveResError } from './helpers'
import { useAuthStore } from '@/store'
import api from '@/api/index.js'

let refreshTokenPromise = null

/**
 * 设置axios实例的拦截器。
 * @param {object} axiosInstance - Axios实例，用于挂载请求和响应拦截器。
 */
export function setupInterceptors(axiosInstance) {
  /**
   * 请求拦截器：在请求发送前进行处理。
   * @param {object} config - Axios请求配置。
   * @returns {object} 修改后的请求配置。
   */
  function reqResolve(config) {
    // 设置BM-Client-Type请求头表示当前客户端
    config.headers['BM-Client-Type'] = `WEB`
    // 如果请求标记为不需要token，则直接返回配置
    // 处理不需要token的请求
    if (config.needToken === false) {
      return config
    }
    const authStore = useAuthStore()
    // 使用Auth Store获取访问令牌
    const { authHeaderKey, accessToken, tokenPrefix } = authStore
    // 如果存在访问令牌，将其添加到请求头中
    if (accessToken) {
      // token: Bearer + xxx
      config.headers[`${authHeaderKey}`] = tokenPrefix + accessToken
    }

    return config
  }

  /**
   * 请求拦截器：在请求错误时进行处理。
   * @param {Error} error - 发生的错误。
   * @returns {Promise} 包含错误的拒绝承诺。
   */
  function reqReject(error) {
    return Promise.reject(error)
  }

  // 定义成功状态码列表
  const SUCCESS_CODES = [0, 200]
  // 当响应状态码为401或402时，尝试刷新访问令牌
  const REFRESH_TOKEN_CODES = [401, 402]

  const blobToString = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.readyState === FileReader.DONE) { // DONE == 2
          resolve(reader.result)
        }
        else {
          reject(new Error('Error reading Blob.'))
        }
      }
      reader.onerror = reject
      reader.readAsText(blob) // 读取 Blob 为文本
    })
  }

  /**
   * 获取一个刷新 token 的 Promise，如果正在刷新则等待，否则发起刷新
   * @returns {Promise<*>}
   */
  async function getRefreshedToken() {
    if (!refreshTokenPromise) {
      refreshTokenPromise = (async () => {
        const authStore = useAuthStore()
        const { refreshAuthHeaderKey, refreshToken, tokenPrefix } = authStore
        try {
          const res = await api.refreshAccessToken({
            needTip: false,
            isRefreshTokenRequest: true,
            headers: {
              [refreshAuthHeaderKey]: tokenPrefix + refreshToken,
            },
          })
          console.warn('刷新 Token res:', res)
          if (res.success) {
            // accessToken
            authStore.setAccessToken(res.result)
          }
          return res.success
        }
        catch (error) {
          console.error('刷新 Token 出错:', error)
        }
        finally {
          refreshTokenPromise = null // 清空 Promise
        }
        return false
      })()
    }
    return refreshTokenPromise
  }

  /**
   * 响应拦截器：在接收到响应后进行处理。
   * @param {object} response - Axios响应。
   * @returns {Promise} 根据响应内容处理后的承诺。
   */
  async function resResolve(response) {
    const { status, config, statusText, headers } = response
    let data = response.data
    // 如果响应内容类型是JSON且包含成功状态码
    if (headers['content-type']?.includes('json')) {
      // 如果响应为blob读取并转为json对象
      if (data instanceof Blob) {
        await blobToString(data).then(dataStr => data = JSON.parse(dataStr))
      }
      // 如果数据中的代码是成功代码之一，返回数据
      if (SUCCESS_CODES.includes(data?.code)) {
        return Promise.resolve(data)
      }
      // 处理刷新令牌请求
      const isRefreshTokenRequest = config.isRefreshTokenRequest || false
      // 如果数据中的代码是刷新令牌代码
      if (isRefreshTokenRequest === false && REFRESH_TOKEN_CODES.includes(data?.code)) {
        if (await getRefreshedToken()) {
          // 标记为重试请求
          config.headers.retryRequest = true
          // 刷新成功则重新发送请求
          return axiosInstance.request(config)
        }
      }
      // 使用数据中的代码或状态码作为错误代码
      const code = data?.code ?? status
      // 判断是否需要提示错误信息
      const needTip = config?.needTip !== false
      // 根据代码处理错误信息，并返回包含错误代码和消息的承诺
      // 根据code处理对应的操作，并返回处理后的message, retry = true 重试请求
      const message = resolveResError(code, data?.message ?? statusText, needTip)

      return Promise.reject({ code, message, error: data ?? response })
    }
    // 如果响应内容不是JSON，直接返回数据或响应
    return Promise.resolve(data ?? response)
  }

  /**
   * 响应拦截器：在响应错误时进行处理。
   * @param {Error} error - 发生的错误。
   * @returns {Promise} 包含处理后的错误代码和消息的拒绝承诺。
   */
  async function resReject(error) {
    // 如果没有错误或没有响应数据
    if (!error || !error.response) {
      // 使用错误代码或默认状态码
      const code = error?.code
      /** 根据code处理对应的操作，并返回处理后的message */
      const message = resolveResError(code, error.message)
      return Promise.reject({ code, message, error })
    }

    // 获取响应数据中的代码、状态和配置
    const { data, status, config } = error.response
    // 使用数据中的代码或状态码作为错误代码
    const code = data?.code ?? status

    // 判断是否需要提示错误信息
    const needTip = config?.needTip !== false

    // 根据代码处理错误信息，并返回包含错误代码和消息的承诺
    const message = resolveResError(code, data?.message ?? error.message, needTip)
    return Promise.reject({ code, message, error: error.response?.data || error.response })
  }

  // 使用拦截器处理请求和响应
  axiosInstance.interceptors.request.use(reqResolve, reqReject)
  axiosInstance.interceptors.response.use(resResolve, resReject)
}
