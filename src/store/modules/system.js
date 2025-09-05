import { defineStore } from 'pinia'
import dictApi from '@/api/dict'
/**
 * 系统状态管理store
 * 用于管理系统相关的全局状态，包括字典数据、系统设置和用户设置
 */
export const useSystemStore = defineStore('system', {
  state: () => ({
    /**
     * 字典数据
     */
    dictionaryData: [],
    /**
     * 系统设置
     */
    systemSettings: {},
    /**
     * 用户设置
     */
    userSettings: {},
  }),
  getters: {
    /**
     * 根据类型获取字典数据
     * @param {string} type - 字典类型编码
     * @returns {Array} 匹配指定类型的字典数据数组
     */
    getDictionaryDataByType(type) {
      return this.dictionaryData.filter(item => item.typeCode === type)
    },
    /**
     * 获取系统设置
     * @returns {Object} 系统设置对象
     */
    getSystemSettings() {
      return this.systemSettings
    },
    /**
     * 获取用户设置
     * @returns {Object} 用户设置对象
     */
    getUserSettings() {
      return this.userSettings
    },
  },
  actions: {
    /**
     * 加载字典数据
     */
    loadDictionaryData() {
      dictApi.getAllDictDataQueryList().then((res) => {
        if (res.success) {
          this.setDictionaryData(res.result)
        }
        else {
          $message.warning('加载字典数据失败')
        }
      })
    },
    /**
     * 设置字典数据
     * @param {Array} dictionaryData - 字典数据数组，默认为空数组
     */
    setDictionaryData(dictionaryData = []) {
      this.dictionaryData = dictionaryData
    },
    /**
     * 设置系统设置
     * @param {Object} systemSettings - 系统设置对象，默认为空对象
     */
    setSystemSettings(systemSettings = {}) {
      this.systemSettings = systemSettings
    },
    /**
     * 设置用户设置
     * @param {Object} userSettings - 用户设置对象，默认为空对象
     */
    setUserSettings(userSettings = {}) {
      this.userSettings = userSettings
    },
  },
})
