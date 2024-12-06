const mongoose = require('mongoose')

/**
 * 车辆信息模型Schema
 * 包含车辆基本信息和所属客户
 */
const vehicleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer', // 关联客户模型
      required: true // 必须关联到一个客户
    },
    brand: {
      type: String,
      required: true, // 品牌为必填项
      trim: true
    },
    model: {
      type: String,
      required: true, // 型号为必填项
      trim: true
    },
    year: {
      type: Number,
      required: true // 年份为必填项
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true, // 车牌号必须唯一
      trim: true
    },
    vin: {
      type: String,
      required: true,
      unique: true, // 车架号必须唯一
      trim: true
    },
    mileage: {
      type: Number,
      required: true // 里程数为必填项
    }
  },
  {
    timestamps: true // 自动添加创建和更新时间戳
  }
)

module.exports = mongoose.model('Vehicle', vehicleSchema)
