const Vehicle = require('../models/vehicle')
const Customer = require('../models/customer')
const response = require('../utils/response')
const logger = require('../utils/logger')
const XLSX = require('xlsx')
// const Appointment = require('../models/appointment')
// const RepairRecord = require('../models/repairRecord')
const mongoose = require('mongoose')
const RepairOrder = require('../models/repairOrder')

class VehicleController {
  /**
   * 创建新车辆
   * @param {Object} ctx - Koa上下文
   */
  async createVehicle(ctx) {
    try {
      const { customerId, brand, model, year, licensePlate, vin, mileage } =
        ctx.request.body

      // 检查客户是否存在
      const customer = await Customer.findById(customerId)
      if (!customer) {
        return response.error(ctx, '客户不存在', 404)
      }

      const vehicle = new Vehicle({
        customer: customerId,
        brand,
        model,
        year,
        licensePlate,
        vin,
        mileage
      })

      await vehicle.save()

      // 更新客户的车辆列表
      customer.vehicles.push(vehicle._id)
      await customer.save()

      ctx.status = 201
      response.success(ctx, vehicle, '车辆创建成功')
    } catch (error) {
      logger.error('创建车辆失败:', error)
      response.error(ctx, '创建车辆失败', 500, error.message)
    }
  }

  /**
   * 获取所有车辆列表
   * @param {Object} ctx - Koa上下文
   */
  async getVehicles(ctx) {
    try {
      const vehicles = await Vehicle.find()
        .populate('customer', 'name phone')
        .sort({ createdAt: -1 })
      response.success(ctx, vehicles)
    } catch (error) {
      logger.error('获取车辆列表失败:', error)
      response.error(ctx, '获取车辆列表失败', 500, error.message)
    }
  }

  /**
   * 根据ID获取车辆详情
   * @param {Object} ctx - Koa上下文
   */
  async getVehicleById(ctx) {
    try {
      const vehicle = await Vehicle.findById(ctx.params.id).populate('customer')

      if (!vehicle) {
        return response.error(ctx, '车辆不存在', 404)
      }

      response.success(ctx, vehicle)
    } catch (error) {
      logger.error('获取车辆详情失败:', error)
      response.error(ctx, '获取车辆详情失败', 500, error.message)
    }
  }

  /**
   * 更新车辆信息
   * @param {Object} ctx - Koa上下文
   */
  async updateVehicle(ctx) {
    try {
      const { brand, model, year, licensePlate, vin, mileage } =
        ctx.request.body

      const vehicle = await Vehicle.findByIdAndUpdate(
        ctx.params.id,
        { brand, model, year, licensePlate, vin, mileage },
        { new: true }
      )

      if (!vehicle) {
        return response.error(ctx, '车辆不存在', 404)
      }

      response.success(ctx, vehicle, '车辆信息更新成功')
    } catch (error) {
      logger.error('更新车辆信息失败:', error)
      response.error(ctx, '更新车辆信息失败', 500, error.message)
    }
  }

  /**
   * 删除车辆
   * @param {Object} ctx - Koa上下文
   */
  async deleteVehicle(ctx) {
    try {
      const vehicle = await Vehicle.findById(ctx.params.id)
      if (!vehicle) {
        return response.error(ctx, '车辆不存在', 404)
      }

      await Customer.findByIdAndUpdate(vehicle.customer, {
        $pull: { vehicles: vehicle._id }
      })

      await vehicle.deleteOne()
      response.success(ctx, null, '车辆删除成功')
    } catch (error) {
      logger.error('删除车辆失败:', error)
      response.error(ctx, '删除车辆失败', 500, error.message)
    }
  }

  /**
   * 获取车辆列表（分页 + 模糊查询）
   * @param {Object} ctx - Koa上下文
   */
  async getVehiclesByPage(ctx) {
    try {
      // 获取分页参数
      const current = parseInt(ctx.query.page) || 1
      const size = parseInt(ctx.query.size) || 10

      // 获取查询参数
      const { brand, licensePlate } = ctx.query

      // 验证分页参数
      if (current < 1 || size < 1) {
        return response.error(ctx, '无效的分页参数', 400)
      }

      // 构建查询条件
      const query = {}
      if (brand) {
        query.brand = { $regex: brand, $options: 'i' }
      }
      if (licensePlate) {
        query.licensePlate = { $regex: licensePlate, $options: 'i' }
      }

      // 计算跳过文档数
      const skip = (current - 1) * size

      // 并行执行总数查询和分页数据查询
      const [total, records] = await Promise.all([
        Vehicle.countDocuments(query),
        Vehicle.find(query)
          .populate('customer', 'name phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(size)
          .exec()
      ])

      response.success(ctx, {
        records,
        total,
        current,
        size,
        pages: Math.ceil(total / size)
      })
    } catch (error) {
      logger.error('获取车辆列表失败:', error)
      response.error(ctx, '获取车辆列表失败', 500, error.message)
    }
  }

  /**
   * 获取车辆维修记录
   */
  // async getVehicleRepairRecords(ctx) {
  //   try {
  //     const repairs = await RepairRecord.find({ vehicle: ctx.params.id })
  //       .populate('mechanic', 'name')
  //       .sort({ createdAt: -1 })
  //     response.success(ctx, repairs)
  //   } catch (error) {
  //     logger.error('获取维修记录失败:', error)
  //     response.error(ctx, '获取维修记录失败', 500, error.message)
  //   }
  // }

  /**
   * 获取车辆预约记录
   */
  // async getVehicleAppointments(ctx) {
  //   try {
  //     const appointments = await Appointment.find({ vehicle: ctx.params.id })
  //       .populate('customer', 'name phone')
  //       .sort({ appointmentTime: -1 })
  //     response.success(ctx, appointments)
  //   } catch (error) {
  //     logger.error('获取预约记录失败:', error)
  //     response.error(ctx, '获取预约记录失败', 500, error.message)
  //   }
  // }

  /**
   * 更新车辆里程数
   */
  async updateVehicleMileage(ctx) {
    try {
      const { mileage } = ctx.request.body
      const vehicle = await Vehicle.findByIdAndUpdate(
        ctx.params.id,
        { mileage },
        { new: true }
      )
      if (!vehicle) {
        return response.error(ctx, '车辆不存在', 404)
      }
      response.success(ctx, vehicle, '里程数更新成功')
    } catch (error) {
      logger.error('更���里程数失败:', error)
      response.error(ctx, '更新里程数失败', 500, error.message)
    }
  }

  /**
   * 批量导入车辆
   */
  async batchImportVehicles(ctx) {
    try {
      const vehicles = ctx.request.body
      vehicles.forEach((vehicle) => {
        vehicle.customer = vehicle.customerId
        delete vehicle.customerId
      })
      const result = await Vehicle.insertMany(vehicles)
      response.success(ctx, result, '批量导入成功')
    } catch (error) {
      logger.error('批量导入失败:', error)
      response.error(ctx, '批量导入失败', 500, error.message)
    }
  }

  /**
   * 导出车辆数据
   * @param {Object} ctx - Koa上下文
   */
  async exportVehicles(ctx) {
    // 查询条件
    const { brand, licensePlate } = ctx.query
    const query = {}
    if (brand) query.brand = { $regex: brand, $options: 'i' }
    if (licensePlate)
      query.licensePlate = { $regex: licensePlate, $options: 'i' }
    try {
      // 获取车辆数据并关联客户信息
      const vehicles = await Vehicle.find(query)
        .populate('customer', 'name phone')
        .lean()

      // 转换数据格式
      const excelData = vehicles.map((vehicle) => ({
        品牌: vehicle.brand,
        型号: vehicle.model,
        年份: vehicle.year,
        车牌号: vehicle.licensePlate,
        车架号: vehicle.vin,
        里程数: vehicle.mileage,
        客户姓名: vehicle.customer ? vehicle.customer.name : '',
        客户电话: vehicle.customer ? vehicle.customer.phone : '',
        创建时间: new Date(vehicle.createdAt).toLocaleString('zh-CN'),
        更新时间: new Date(vehicle.updatedAt).toLocaleString('zh-CN')
      }))

      // 创建工作簿
      const wb = XLSX.utils.book_new()

      // 将数据转换为工作表
      const ws = XLSX.utils.json_to_sheet(excelData, {
        header: [
          '品牌',
          '型号',
          '年份',
          '车牌号',
          '车架号',
          '里程数',
          '客户姓名',
          '客户电话',
          '创建时间',
          '更新时间'
        ]
      })

      // 设置列宽
      ws['!cols'] = [
        { wch: 15 }, // 品牌
        { wch: 15 }, // 型号
        { wch: 10 }, // 年份
        { wch: 12 }, // 车牌号
        { wch: 20 }, // 车架号
        { wch: 10 }, // 里程数
        { wch: 15 }, // 客户姓名
        { wch: 15 }, // 客户电话
        { wch: 20 }, // 创建时间
        { wch: 20 } // 更新时间
      ]

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '车辆列表')

      // 生成二进制数据
      const buffer = XLSX.write(wb, {
        type: 'buffer',
        bookType: 'xlsx',
        bookSST: false,
        compression: true
      })

      // 生成文件名
      const filename = `车辆列表_${new Date()
        .toLocaleDateString('zh-CN')
        .replace(/\//g, '-')}.xlsx`

      // 设置响应头
      ctx.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(
          filename
        )}`,
        'Content-Length': buffer.length
      })

      // 返回文件内容
      ctx.body = buffer
    } catch (error) {
      logger.error('导出车辆数据失败:', error)
      response.error(ctx, '导出车辆数据失败', 500, error.message)
    }
  }

  /**
   * 获取车辆统计信息
   */
  async getVehicleStats(ctx) {
    try {
      const [totalVehicles, brandStats] = await Promise.all([
        Vehicle.countDocuments(),
        Vehicle.aggregate([
          { $group: { _id: '$brand', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ])

      response.success(ctx, {
        totalVehicles,
        brandStats,
        averageMileage: await Vehicle.aggregate([
          { $group: { _id: null, avg: { $avg: '$mileage' } } }
        ]).then((result) => result[0]?.avg.toFixed(2) || 0)
      })
    } catch (error) {
      logger.error('获取统计信息失败:', error)
      response.error(ctx, '获取统计信息失败', 500, error.message)
    }
  }

  /**
   * 获取车辆品牌列表
   */
  async getVehicleBrands(ctx) {
    try {
      const brands = await Vehicle.distinct('brand')
      response.success(ctx, brands)
    } catch (error) {
      logger.error('获取品牌列表失败:', error)
      response.error(ctx, '获取品牌列表失败', 500, error.message)
    }
  }

  /**
   * 获取指定品牌的车型列表
   */
  async getVehicleModels(ctx) {
    try {
      const { brand } = ctx.query
      const models = await Vehicle.distinct('model', { brand })
      response.success(ctx, models)
    } catch (error) {
      logger.error('获取车型列表失败:', error)
      response.error(ctx, '获取车型列表失败', 500, error.message)
    }
  }

  /**
   * 批量删除车辆
   * @param {Object} ctx - Koa上下文
   * @param {String} ctx.request.body.ids - 车辆ID数组
   */
  async batchDeleteVehicles(ctx) {
    try {
      const { ids } = ctx.request.body

      // 参数验证
      if (!Array.isArray(ids) || ids.length === 0) {
        return response.error(ctx, '请提供要删除的车辆ID列表', 400)
      }

      // 验证所有ID是否有效
      if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        return response.error(ctx, '存在无效的车辆ID', 400)
      }

      // 查找所有要删除的车辆
      const vehicles = await Vehicle.find({ _id: { $in: ids } })
      if (vehicles.length === 0) {
        return response.error(ctx, '未找到要删除的车辆', 404)
      }

      // 检查是否有维修中的车辆
      const repairingVehicles = await RepairOrder.find({
        vehicle: { $in: ids },
        status: { $in: ['pending', 'inspecting', 'quoted', 'repairing'] }
      })

      if (repairingVehicles.length > 0) {
        return response.error(ctx, '存在维修中的车辆，无法删除', 400)
      }

      // 收集所有客户ID和车辆ID
      const customerIds = [
        ...new Set(vehicles.map((v) => v.customer.toString()))
      ]
      const vehicleIds = vehicles.map((v) => v._id)

      // 从客户的vehicles数组中移除这些车辆
      await Customer.updateMany(
        { _id: { $in: customerIds } },
        { $pull: { vehicles: { $in: vehicleIds } } }
      )

      // 删除车辆
      const result = await Vehicle.deleteMany({ _id: { $in: ids } })

      response.success(
        ctx,
        { deletedCount: result.deletedCount },
        `成功删除${result.deletedCount}辆车`
      )
    } catch (error) {
      logger.error('批量删除车辆失败:', error)
      response.error(ctx, '批量删除车辆失败', 500, error.message)
    }
  }

  /**
   * 根据车牌号查询车辆信息
   * @param {Object} ctx - Koa上下文
   */
  async getVehicleByPlate(ctx) {
    try {
      const { licensePlate } = ctx.query

      // 参数验证
      if (!licensePlate) {
        return response.error(ctx, '请提供车牌号', 400)
      }

      // 车牌号格式验证（示例：简单的格式验证）
      const platePattern =
        /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,6}$/
      if (!platePattern.test(licensePlate)) {
        return response.error(ctx, '无效的车牌号格式', 400)
      }

      // 查询车辆信息
      const vehicle = await Vehicle.findOne({
        licensePlate: licensePlate.trim()
      })
        .populate('customer', 'name phone email address')
        .exec()

      if (!vehicle) {
        return response.success(ctx, null, '未找到车辆信息')
      }

      response.success(ctx, vehicle)
    } catch (error) {
      logger.error('根据车牌号查询车辆失败:', error)
      response.error(ctx, '查询车辆信息失败', 500, error.message)
    }
  }
}

module.exports = new VehicleController()
