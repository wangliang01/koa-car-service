/**
 * 业务错误码配置
 * 错误码规则：
 * 10xxx - 用户相关错误
 * 20xxx - 客户相关错误
 * 30xxx - 车辆相关错误
 * 40xxx - 预约相关错误
 */
module.exports = {
  // 用户相关 10xxx
  USER_EXISTS: 10001,           // 用户已存在
  INVALID_CREDENTIALS: 10002,   // 无效的凭证
  USER_NOT_FOUND: 10003,       // 用户不存在
  INVALID_PASSWORD: 10004,      // 当前密码错误
  SAME_PASSWORD: 10005,        // 新密码与当前密码相同

  // 客户相关 20xxx
  CUSTOMER_NOT_FOUND: 20001,   // 客户不存在
  INVALID_PHONE: 20002,        // 无效的电话号码

  // 车辆相关 30xxx
  VEHICLE_NOT_FOUND: 30001,    // 车辆不存在
  DUPLICATE_PLATE: 30002,      // 重复的车牌号

  // 预约相关 40xxx
  INVALID_DATE: 40001,         // 无效的预约日期
  SLOT_NOT_AVAILABLE: 40002    // 预约时段已满
}; 