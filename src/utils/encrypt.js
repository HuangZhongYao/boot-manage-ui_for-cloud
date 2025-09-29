/**
 * @Author: zuuuYao
 * @LastEditor: zuuuYao
 * @LastEditTime: 2025/09/29 14:45
 */
import JSEncrypt from 'jsencrypt'

// 初始化加密实例
const encryptor = new JSEncrypt()

/**
 * RSA加密函数
 * @param {string} text - 需要加密的文本（如密码）
 * @param {string} publicKey - 公钥
 * @returns {string} 加密后的字符串
 */
export function rsaEncrypt(text, publicKey) {
  // 设置公钥（替换为你的实际公钥）
  encryptor.setPublicKey(publicKey)
  if (!text)
    return ''
  try {
    return encryptor.encrypt(text) || ''
  }
  catch (error) {
    console.error('RSA加密失败:', error)
    return ''
  }
}
