/**
 * 生成工单号工具函数
 * @param {String} prefix - 前缀，默认为 'RO'
 * @returns {String} 生成的工单号
 *
 * 工单号格式：前缀 + 年月日 + 3位序号 + 1位随机字符
 * 示例：RO202312090123A
 */
function generateOrderNo(prefix = 'RO') {
  try {
    // 生成日期部分
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')

    // 生成序号部分 - 时间戳后3位
    const serialNum = String(date.getTime()).slice(-3)

    // 生成随机字符 (A-Z)
    const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26))

    // 组合工单号
    return `${prefix}${dateStr}${serialNum}${randomChar}`
  } catch (error) {
    logger.error('生成工单号失败:', error)
    throw new Error('生成工单号失败')
  }
}

module.exports = generateOrderNo
