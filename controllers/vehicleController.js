const Vehicle = require('../models/vehicle')
const Customer = require('../models/customer')
const response = require('../utils/response')
const logger = require('../utils/logger')
const XLSX = require('xlsx')
// const Appointment = require('../models/appointment')
// const RepairRecord = require('../models/repairRecord')

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

      // 计算跳过的文档数
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
      logger.error('更新里程数失败:', error)
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
   */
  async exportVehicles(ctx) {
    try {
      const vehicles = await Vehicle.find()
        .populate('customer', 'name phone')
        .lean()

      const ws = XLSX.utils.json_to_sheet(vehicles)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Vehicles')

      ctx.set(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      ctx.set('Content-Disposition', 'attachment; filename=vehicles.xlsx')

      const buf = XLSX.write(wb, {
        type: 'buffer',
        bookType: 'xlsx',
        compression: true
      })
      ctx.body = buf
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
}

module.exports = new VehicleController()
