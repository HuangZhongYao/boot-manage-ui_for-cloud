import { request } from '@/utils/index.js'

export default {
  /**
   * 上传文件
   * @param file
   * @returns Promise
   */
  uploadFile: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/bm-resource/file/uploadFile', formData)
  },
  /**
   * 上传多个文件
   * @param files 文件数组
   * @returns Promise
   */
  uploadFiles: (files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return request.post('/bm-resource/file/uploadFiles', formData)
  },
}
