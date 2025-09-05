import { request } from '@/utils'

export default {
  /**
   * 根据字典类型id获取字典数据
   * @param params
   * @returns {*}
   */
  getDictDataQueryList: (params = {}) => request.get('/bm-system/dict/dictDataQueryList', { params }),
  /**
   * 根据字典类型code获取字典数据
   * @param params
   * @returns {*}
   */
  getDictDataQueryListByCode: (params = {}) => request.get('/bm-system/dict/dictDataQueryListByDictTypeCode', { params }),
  /**
   * 获取所有字典数据
   * @param params
   * @returns {*}
   */
  getAllDictDataQueryList: (params = {}) => request.get('/bm-system/dict/allDictDataQueryList', { params }),
}
