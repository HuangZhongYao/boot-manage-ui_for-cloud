/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:24:53
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { getActivePinia } from 'pinia'
import { useWebSocketStore } from '@/store/modules/websocket'
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
          const { authHeaderKey } = useAuthStore()
          const wsStore = useWebSocketStore()

          if (authHeaderKey && !wsStore.isConnected) {
            wsStore.initializeConnect()
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
