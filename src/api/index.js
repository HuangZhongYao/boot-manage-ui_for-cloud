/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/04 22:50:38
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { request } from '@/utils'

export default {
  // 获取用户信息
  getUser: () => request.get('/bm-auth/auth/authenticationUserDetail'),
  // 刷新token
  refreshAccessToken: config => request.get('/bm-auth/auth/refreshToken', config),
  // 登出
  logout: () => request.get('/bm-auth/auth/loginOut', {}, { needTip: false }),
  // 切换当前角色
  switchCurrentRole: role => request.post(`/auth/current-role/switch/${role}`),
  // 获取角色权限
  getPermissions: () => request.get('/bm-auth/auth/queryPermissionsTree'),
  // 验证菜单路径
  validateMenuPath: path => request().get(`/permission/menu/validate?path=${path}`),
  // 获取公钥
  getEncryptionPublicKey: () => request.get('/bm-auth/encryption/getEncryptionPublicKey'),
}
