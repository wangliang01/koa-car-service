const generateOrderNo = require('../../utils/generateOrderNo')

describe('generateOrderNo', () => {
  test('生成的工单号格式正确', () => {
    const orderNo = generateOrderNo()

    // 检查长度
    expect(orderNo.length).toBe(14)

    // 检查前缀
    expect(orderNo.startsWith('RO')).toBe(true)

    // 检查日期部分（8位数字）
    const dateStr = orderNo.slice(2, 10)
    expect(dateStr).toMatch(/^\d{8}$/)

    // 检查序号部分（3位数字）
    const serialNum = orderNo.slice(10, 13)
    expect(serialNum).toMatch(/^\d{3}$/)

    // 检查随机字母（1位大写字母）
    const randomChar = orderNo.slice(13)
    expect(randomChar).toMatch(/^[A-Z]$/)
  })

  test('支持自定义前缀', () => {
    const orderNo = generateOrderNo('WO')
    expect(orderNo.startsWith('WO')).toBe(true)
  })
})
