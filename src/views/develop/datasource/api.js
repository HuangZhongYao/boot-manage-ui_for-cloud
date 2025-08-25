import { request } from '@/utils'

export default {
  create: data => request.post('/bm-resource/dataSource/addDataSource', data),
  read: (params = {}) => request.get('/bm-resource/dataSource/pageQueryList', { params }),
  update: data => request.patch(`/bm-resource/dataSource/editDataSource`, data),
  delete: data => request.delete(`/bm-resource/dataSource/delDataSource`, { data }),
}
