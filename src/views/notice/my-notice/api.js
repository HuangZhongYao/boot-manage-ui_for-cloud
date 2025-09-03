import { request } from '@/utils/'

export default {
  /**
   * 分页查询我的通知记录
   * @param {Object} params - 查询参数对象。
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  read: (params = {}) => request.get('/bm-system/notifications/queryMyNotificationRecords', { params }),
  /**
   * 已读通知记录
   * @param data
   * @returns {*}
   */
  readNotificationRecords: data => request.patch(`/bm-system/notifications/readNotificationRecords`, data),
  /**
   * 删除通知记录
   * @param data
   * @returns {*}
   */
  delNotificationRecord: data => request.delete('/bm-system/notifications/delNotificationRecord', { data }),
}
