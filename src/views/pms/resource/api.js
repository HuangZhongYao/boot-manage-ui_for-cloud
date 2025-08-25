/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2024/04/01 15:52:04
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import axios from 'axios'
import { request } from '@/utils'

export default {
  getMenuTree: () => request.get('/bm-system/resources/resourcesTree'),
  getButtons: ({ parentId }) => request.get(`/bm-system/resources/button/${parentId}`),
  getComponents: () => axios.get(`${import.meta.env.VITE_PUBLIC_PATH}components.json`),
  addPermission: data => request.post('/bm-system/resources/addResources', data),
  savePermission: (id, data) => request.patch(`/bm-system/resources/editResources`, data),
  setState: data => request.patch(`/bm-system/resources/setState`, data),
  deletePermission: data => request.delete(`/bm-system/resources/delResources`, { data }),
}
