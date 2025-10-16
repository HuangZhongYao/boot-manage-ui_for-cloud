/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:29:27
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import userApi from '../user/api'
import { request } from '@/utils'

export default {
  create: data => request.post('/bm-system/role/addRole', data),
  read: (params = {}) => request.get('/bm-system/role/pageQueryList', { params }),
  update: data => request.patch(`/bm-system/role/editRole`, data),
  delete: data => request.delete(`/bm-system/role/delRole`, { data }),
  // 查询角色下的用户
  queryRoleUser: roleId => request.get(`/bm-system/role/queryRoleUserList?id=${roleId}`),
  // 分配角色的用户接口
  setRoleUser: data => request.post('/bm-system/role/setRoleUser', data),
  // 设置角色启用状态
  setState: data => request.patch('/bm-system/role/setState', data),
  // 查询全部用户
  getAllUsers: () => userApi.getAllUsers(),
  // 获取所有已启用的角色
  getAllRoles: () => request.get('/bm-system/role/queryList?enable=true'),
  getAllPermissionTree: () => request.get('/bm-system/resources/resourcesTree'),
}
