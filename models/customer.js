const mongoose = require('mongoose');

/**
 * 客户信息模型Schema
 * 包含基本联系信息和关联的车辆列表
 */
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,    // 客户姓名为必填项
    trim: true        // 自动去除首尾空格
  },
  phone: {
    type: String,
    required: true,    // 联系电话为必填项
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true   // 邮箱地址自动转小写
  },
  address: {
    type: String,
    trim: true
  },
  vehicles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'    // 关联车辆模型
  }]
}, {
  timestamps: true      // 自动添加创建和更新时间戳
});

module.exports = mongoose.model('Customer', customerSchema); 