/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:24:53
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { getActivePinia } from 'pinia'
import { webSocketService } from '@/utils/websocket/index.js'
import { useAuthStore } from '@/store/index.js'

export function createPageLoadingGuard(router) {
  router.beforeEach(() => {
    $loadingBar.start()
  })

  router.afterEach(() => {
    setTimeout(() => {
      $loadingBar.finish()
      // 检查 Pinia 是否已激活
      if (getActivePinia()) {
        try {
          // 获取访问令牌
          const { authHeaderKey } = useAuthStore()

          // 如果是已登录状态，且为连接websocket则初始化连接
          if (authHeaderKey && !webSocketService.isConnected()) {
            webSocketService.initializeConnect()
          }
        }
        catch (error) {
          console.error('PageLoadingGuard Failed to initialize WebSocket:', error)
        }
      }
    }, 200)
  })

  router.onError(() => {
    $loadingBar.error()
  })
}
