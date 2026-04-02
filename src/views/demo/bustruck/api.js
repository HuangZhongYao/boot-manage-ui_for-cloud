import { request } from '@/utils/index.js'

/**
 * 车辆Api接口
 * Desc   Created by Velocity Generate.
 * Time   2024-07-31 20:23:37
 * Author zuuuYao (https://github.com/HuangZhongYao)
 * Copyright © 2024 ZuuuuYao By GitHub
 */
export default {
  /**
   * 创建车辆。
   * @param {object} data - 包含新车辆信息的对象。
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  create: data => request.post('/bm-example/bustruck/addBusTruck', data),

  /**
   * 读取车辆列表，支持分页查询。
   * @param {object} params - 查询参数，包含分页信息等。
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  read: (params = {}) => request.get('/bm-example/bustruck/pageQueryList', { params }),

  /**
   * 更新车辆信息。
   * @param {object} data - 包含待更新车辆信息的对象，必须包含车辆ID。
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  update: data => request.patch(`/bm-example/bustruck/editBusTruck`, data),

  /**
   * 删除指定ID的车辆。
   * @param {Array} data - 待删除车辆的ID数组。示列{ids:[1,2,3,4]}
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  delete: data => request.delete('/bm-example/bustruck/delBusTruck', { data }),
}
