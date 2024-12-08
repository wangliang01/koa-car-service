const mongoose = require('mongoose')

/**
 * 预约信息模型Schema
 * 包含预约的客户、车辆、时间和服务类型等信息
 */
const appointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer', // 关联客户模型
      required: true
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle', // 关联车辆模型
      required: true
    },
    appointmentDate: {
      type: Date,
      required: true // 预约时间为必填项
    },
    serviceType: {
      type: String,
      required: true,
      enum: [
        'maintenance', // 保养
        'repair', // 维修
        'inspection', // 检查
        'other' // 其他
      ]
    },
    description: {
      type: String
    },
    status: {
      type: String,
      enum: [
        'pending', // 待确认
        'confirmed', // 已确认
        'completed', // 已完成
        'cancelled' // 已取消
      ],
      default: 'pending'
    },
    cancelReason: {
      type: String,
      // 只有在状态为cancelled时才需要
      required: function () {
        return this.status === 'cancelled'
      }
    }
  },
  {
    timestamps: true // 自动添加创建和更新时间戳
  }
)

module.exports = mongoose.model('Appointment', appointmentSchema)
