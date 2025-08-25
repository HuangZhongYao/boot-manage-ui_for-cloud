/**
 * Time      2024-08-18 12:24
 * Author    ZhongYao.Huang (https://github.com/HuangZhongYao)
 * Copyright © 2024 ZuuuuYao By Github
 */

import { request } from '@/utils'
import dictApi from '@/api/dict'

export default {
  /**
   * 添加字典类型
   * @param data
   * @returns {*}
   */
  addDictType: data => request.post('/bm-system/dict/addDictType', data),

  /**
   * 获取字典类型树
   * @param params
   * @returns {*}
   */
  getDictTypeTree: (params = {}) => request.get('/bm-system/dict/dictTypeTree', { params }),

  /**
   * 编辑字典类型
   * @param data
   * @returns {*}
   */
  editDictType: data => request.patch(`/bm-system/dict/editDictType`, data),

  /**
   * 删除字典类型
   * @param data
   * @returns {*}
   */
  delDictType: data => request.delete(`/bm-system/dict/delDictType`, { data }),

  /**
   * 设置字典数据启用状态
   * @param data
   * @returns {*}
   */
  setStateDictData: data => request.patch('/bm-system/dict/setStateDictData', data),

  /**
   * 添加字典数据
   * @param data
   * @returns {*}
   */
  addDictData: data => request.post('/bm-system/dict/addDictData', data),

  /**
   * 根据字典类型id获取字典数据
   * @param params
   * @returns {*}
   */
  getDictDataQueryList: dictApi.getDictDataQueryList,

  /**
   * 编辑字典数据
   * @param data
   * @returns {*}
   */
  editDictData: data => request.patch(`/bm-system/dict/editDictData`, data),

  /**
   * 删除字典数据
   * @param data
   * @returns {*}
   */
  delDictData: data => request.delete(`/bm-system/dict/delDictData`, { data }),

  /**
   * 设置字典数据启用状态
   * @param data
   * @returns {*}
   */
  setStateDictType: data => request.patch('/bm-system/dict/setStateDictType', data),
}
