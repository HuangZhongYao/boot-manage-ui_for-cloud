import { request } from '@/utils/'

export default {
  /**
   * 分页查询我的通知记录
   * @param {object} params - 查询参数对象。
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  read: (params = {}) => request.get('/bm-system/notifications/queryMyNotificationRecords', { params }),
  /**
   * 获取未读通知记录数
   * @returns {Promise}
   */
  countUnreadNotifications: () => request.get('/bm-system/notifications/countUnreadNotifications'),
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
