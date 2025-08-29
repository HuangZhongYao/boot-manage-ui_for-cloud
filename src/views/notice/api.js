import { request } from '@/utils/'

export default {
  read: (param = {}) => request.get('/bm-system/notifications/pageQueryList', { param }),
  /**
   * 创建公告
   * @param {Object} data - 包含公告信息的对象。
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  create: data => request.post('/bm-system/notifications/addNotifications', data),

  /**
   * 更新公告信息。
   * @param {Object} data - 包含待更新公告信息的对象，必须包含公告ID。
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  update: data => request.patch(`/bm-system/notifications/editNotifications`, data),

  /**
   * 发布公告信息。
   * @param {Object} data - 包含待更新公告信息的对象，必须包含公告ID。
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  publish: data => request.patch(`/bm-system/notifications/publish`, data),
  /**
   * 删除指定ID的公告。
   * @param {Object} data - 待删除公告的ID。
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  delete: data => request.delete('/bm-system/notifications/delNotifications', { data }),
}
