const mongoose = require('mongoose')
const generateOrderNo = require('../utils/generateOrderNo')

/**
 * 维修工单模型Schema
 */
const repairOrderSchema = new mongoose.Schema(
  {
    // 基础信息
    orderNo: { type: String, required: true, unique: true }, // 工单号
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    mileage: { type: Number, required: true }, // 进厂里程数
    faultDesc: String, // 故障描述

    // 检查记录
    inspectionItems: [
      {
        name: { type: String, required: true }, // 检查项目名称
        result: { type: String, required: true }, // 检查结果
        remark: String // 备注说明
      }
    ],

    // 维修项目
    repairItems: [
      {
        name: { type: String, required: true }, // 维修项目名称
        price: { type: Number, required: true }, // 项目价格
        parts: [
          {
            part: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Part'
            }, // 配件引用
            name: { type: String, required: true }, // 配件名称
            quantity: { type: Number, required: true }, // 数量
            price: { type: Number, required: true } // 单价
          }
        ]
      }
    ],

    // 费用信息
    partsAmount: { type: Number, default: 0 }, // 配件费用
    laborAmount: { type: Number, default: 0 }, // 工时费用
    totalAmount: { type: Number, default: 0 }, // 总金额

    // 工单状态
    status: {
      type: String,
      enum: [
        'pending', // 待处理
        'inspecting', // 检查中
        'repairing', // 维修中
        'completed', // 已完工
        'delivered' // 已交车
      ],
      default: 'pending'
    },

    // 人员信息
    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }, // 维修技师
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }, // 检查员

    // 时间记录
    estimatedCompletionTime: Date, // 预计完工时间
    actualCompletionTime: Date, // 实际完工时间
    deliveryTime: Date, // 交车时间

    // 其他信息
    customerSignature: String, // 客户签字(base64)
    remark: String // 备注
  },
  {
    timestamps: true
  }
)

// 生成工单号
repairOrderSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      this.orderNo = generateOrderNo()
    }
    next()
  } catch (error) {
    next(error)
  }
})

// 计算总金额
repairOrderSchema.pre('save', function (next) {
  try {
    if (this.repairItems && this.repairItems.length > 0) {
      // 计算配件总额
      this.partsAmount = this.repairItems.reduce((total, item) => {
        const itemPartsAmount = item.parts
          ? item.parts.reduce(
              (sum, part) => sum + (part.price || 0) * (part.quantity || 0),
              0
            )
          : 0
        return total + itemPartsAmount
      }, 0)

      // 计算工时费总额
      this.laborAmount = this.repairItems.reduce(
        (total, item) => total + (item.price || 0),
        0
      )

      // 计算总金额
      this.totalAmount = this.partsAmount + this.laborAmount
    }
    next()
  } catch (error) {
    next(error)
  }
})

module.exports = mongoose.model('RepairOrder', repairOrderSchema)
