const mongoose = require('mongoose')

/**
 * 客户信息模型Schema
 * 包含基本联系信息和关联的车辆列表
 */
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // 客户姓名为必填项
      trim: true // 自动去除首尾空格
    },
    customerType: {
      type: String,
      required: true,
      enum: ['personal', 'business'], // 个人/企业
      default: 'personal'
    },
    business: {
      companyName: {
        // 公司名称
        type: String,
        trim: true
      },
      taxNumber: {
        // 税号
        type: String,
        trim: true
      },
      industry: {
        // 所属行业
        type: String,
        trim: true
      },
      contactPerson: {
        // 企业联系人
        type: String,
        trim: true
      }
    },
    phone: {
      type: String,
      required: true, // 联系电话为必填项
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true // 邮箱地址自动转小写
    },
    address: {
      type: String,
      trim: true
    },
    vehicles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle' // 关联车辆模型
      }
    ]
  },
  {
    timestamps: true // 自动添加创建和更新时间戳
  }
)

customerSchema.pre('save', function (next) {
  if (this.customerType === 'business' && !this.business.companyName) {
    const err = new Error('企业客户必须填写公司名称')
    return next(err)
  }
  next()
})

module.exports = mongoose.model('Customer', customerSchema)
