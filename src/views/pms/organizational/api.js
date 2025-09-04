import { request } from '@/utils/'

export default {
  /**
   * 获取组织树
   * @param {object} param -
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  organizationTree: (param = {}) => request.get('/bm-system/organization/organizationTree', { param }),
  /**
   * 分页查询组织
   * @param {object} param - 包含查询条件的对象。
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  read: (param = {}) => request.get('/bm-system/organization/pageQueryList', { param }),
  /**
   * 创建组织
   * @param {object} data - 包含组织信息的对象。
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  create: data => request.post('/bm-system/organization/addOrganization', data),

  /**
   * 更新组织信息。
   * @param {object} data - 包含待更新组织信息的对象，必须包含组织ID。
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  update: data => request.patch(`/bm-system/organization/editOrganization`, data),

  /**
   * 删除指定ID的组织。
   * @param {object} data - 待删除组织的ID。
   * @returns {Promise} - 一个Promise对象，用于处理异步请求的结果。
   */
  delete: data => request.delete('/bm-system/organization/delOrganization', { data }),
}
