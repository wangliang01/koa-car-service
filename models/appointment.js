const mongoose = require('mongoose');

/**
 * 预约信息模型Schema
 * 包含预约的客户、车辆、时间和服务类型等信息
 */
const appointmentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',     // 关联客户模型
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',      // 关联车辆模型
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true       // 预约时间为必填项
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['maintenance', 'repair', 'inspection', 'other']  // 服务类型限定范围
  },
  description: {
    type: String,
    required: true       // 服务描述为必填项
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],  // 预约状态限定范围
    default: 'pending'   // 默认状态为待确认
  },
  notes: String           // 额外备注，选填
}, {
  timestamps: true         // 自动添加创建和更新时间戳
});

module.exports = mongoose.model('Appointment', appointmentSchema); 