const RepairOrder = require('../models/repairOrder')
const Vehicle = require('../models/vehicle')
const Customer = require('../models/customer')
const response = require('../utils/response')
const logger = require('../utils/logger')
const generateOrderNo = require('../utils/generateOrderNo')
class RepairOrderController {
  /**
   * 创建维修工单
   * @param {Object} ctx.request.body
   * @param {Object} ctx.request.body.customer - 客户信息
   * @param {Object} ctx.request.body.vehicle - 车辆信息
   * @param {String} ctx.request.body.faultDesc - 故障描述
   * @param {String} ctx.request.body.remark - 备注
   * @param {Boolean} ctx.request.body.isNewCustomer - 是否新客户
   */
  async createRepairOrder(ctx) {
    try {
      const { customer, vehicle, faultDesc, remark, isNewCustomer } =
        ctx.request.body

      let customerDoc, vehicleDoc

      if (isNewCustomer) {
        // 1. 检查车牌号和VIN是否已存在
        const [existingVehicleByPlate, existingVehicleByVin] =
          await Promise.all([
            Vehicle.findOne({ licensePlate: vehicle.licensePlate }),
            Vehicle.findOne({ vin: vehicle.vin })
          ])

        if (existingVehicleByPlate) {
          return response.error(ctx, '该车牌号已存在', 400)
        }
        if (existingVehicleByVin) {
          return response.error(ctx, '该VIN码已存在', 400)
        }

        // 2. 创建新客户
        customerDoc = new Customer({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address
        })
        await customerDoc.save()

        // 3. 创建新车辆
        vehicleDoc = new Vehicle({
          customer: customerDoc._id,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          vin: vehicle.vin,
          mileage: vehicle.mileage
        })
        await vehicleDoc.save()

        // 4. 更新客户的车辆列表
        customerDoc.vehicles.push(vehicleDoc._id)
        await customerDoc.save()
      } else {
        // 老客户，直接使用已有的客户和车辆ID
        customerDoc = await Customer.findById(customer._id)
        if (!customerDoc) {
          return response.error(ctx, '客户不存在', 404)
        }

        vehicleDoc = await Vehicle.findById(vehicle._id)
        if (!vehicleDoc) {
          return response.error(ctx, '车辆不存在', 404)
        }

        // 更���车辆里程数
        if (vehicle.mileage && vehicle.mileage > vehicleDoc.mileage) {
          vehicleDoc.mileage = vehicle.mileage
          await vehicleDoc.save()
        }
      }

      // 5. 创建维修工单
      const repairOrder = new RepairOrder({
        orderNo: generateOrderNo('RO'),
        customer: customerDoc._id,
        vehicle: vehicleDoc._id,
        mileage: vehicle.mileage,
        faultDesc,
        remark,
        status: 'pending' // 初始状态：待处理
      })
      await repairOrder.save()

      // 6. 返回完整的工单信息
      const populatedRepairOrder = await RepairOrder.findById(repairOrder._id)
        .populate('customer')
        .populate('vehicle')

      ctx.status = 201
      response.success(ctx, populatedRepairOrder, '维修工单创建成功')
    } catch (error) {
      logger.error('创建维修工单失败:', error)
      response.error(ctx, '创建维修工单失败', 500, error.message)
    }
  }

  /**
   * 通过车牌号获取车辆信息
   */
  async getVehicleByPlate(ctx) {
    try {
      const { licensePlate } = ctx.query
      const vehicle = await Vehicle.findOne({ licensePlate }).populate(
        'customer',
        'name phone email address'
      )

      if (!vehicle) {
        return response.error(ctx, '车辆不存在', 404)
      }

      response.success(ctx, vehicle)
    } catch (error) {
      logger.error('获取车辆信息失败:', error)
      response.error(ctx, '获取车辆信息失败', 500, error.message)
    }
  }

  /**
   * 更新检查记录
   */
  async updateInspection(ctx) {
    try {
      const { inspectionItems, customerItems } = ctx.request.body

      const repairOrder = await RepairOrder.findByIdAndUpdate(
        ctx.params.id,
        {
          inspectionItems,
          customerItems,
          status: 'inspecting'
        },
        { new: true }
      )

      if (!repairOrder) {
        return response.error(ctx, '维修工单不存在', 404)
      }

      response.success(ctx, repairOrder, '检查记录更新成功')
    } catch (error) {
      logger.error('更新检查记录失败:', error)
      response.error(ctx, '更新检查记录失败', 500, error.message)
    }
  }

  /**
   * 更新维修项目和报价
   */
  async updateRepairItems(ctx) {
    try {
      const { repairItems, totalAmount, estimatedCompletionTime } =
        ctx.request.body

      const repairOrder = await RepairOrder.findByIdAndUpdate(
        ctx.params.id,
        {
          repairItems,
          totalAmount,
          estimatedCompletionTime,
          status: 'quoted'
        },
        { new: true }
      )

      if (!repairOrder) {
        return response.error(ctx, '维修工单不存在', 404)
      }

      response.success(ctx, repairOrder, '维修项目更新成功')
    } catch (error) {
      logger.error('更新维修项目失败:', error)
      response.error(ctx, '更新维修项目失败', 500, error.message)
    }
  }

  /**
   * 更新工单状态
   */
  async updateStatus(ctx) {
    try {
      const {
        status,
        mechanic,
        inspector,
        actualCompletionTime,
        deliveryTime
      } = ctx.request.body

      const update = { status }
      if (mechanic) update.mechanic = mechanic
      if (inspector) update.inspector = inspector
      if (actualCompletionTime)
        update.actualCompletionTime = actualCompletionTime
      if (deliveryTime) update.deliveryTime = deliveryTime

      const repairOrder = await RepairOrder.findByIdAndUpdate(
        ctx.params.id,
        update,
        { new: true }
      )

      if (!repairOrder) {
        return response.error(ctx, '维修工单不存在', 404)
      }

      response.success(ctx, repairOrder, '工单状态更新成功')
    } catch (error) {
      logger.error('更新工单状态失败:', error)
      response.error(ctx, '更新工单状态失败', 500, error.message)
    }
  }

  /**
   * 获取工单列表(分页)
   */
  async getRepairOrders(ctx) {
    try {
      const { page = 1, size = 10, status } = ctx.query

      const query = {}
      if (status) query.status = status

      const [total, records] = await Promise.all([
        RepairOrder.countDocuments(query),
        RepairOrder.find(query)
          .populate('customer', 'name phone')
          .populate('vehicle', 'brand model licensePlate')
          .populate('mechanic', 'name')
          .populate('inspector', 'name')
          .sort({ createdAt: -1 })
          .skip((page - 1) * size)
          .limit(size)
      ])

      response.success(ctx, {
        records,
        total,
        page: Number(page),
        size: Number(size)
      })
    } catch (error) {
      logger.error('获取工单列表失败:', error)
      response.error(ctx, '获取工单列表失败', 500, error.message)
    }
  }

  /**
   * 获取工单详情
   */
  async getRepairOrderById(ctx) {
    try {
      const repairOrder = await RepairOrder.findById(ctx.params.id)
        .populate('customer')
        .populate('vehicle')
        .populate('mechanic', 'name')
        .populate('inspector', 'name')
        .populate('repairItems.parts.part')

      if (!repairOrder) {
        return response.error(ctx, '维修工单不存在', 404)
      }

      response.success(ctx, repairOrder)
    } catch (error) {
      logger.error('获取工单详情失败:', error)
      response.error(ctx, '获取工单详情失败', 500, error.message)
    }
  }

  /**
   * 检查车辆是否已存在
   * @param {Object} ctx.request.body
   * @param {String} ctx.request.body.licensePlate - 车牌号
   * @param {String} ctx.request.body.vin - 车架号
   */
  async isExist(ctx) {
    try {
      const { licensePlate, vin } = ctx.request.body

      // 参数验证
      if (!licensePlate && !vin) {
        return response.error(ctx, '请至少提供车牌号或车架号', 400)
      }

      // 构建查询条件
      const query = {}
      if (licensePlate) query.licensePlate = licensePlate
      if (vin) query.vin = vin

      // 查询车辆信息
      const vehicle = await Vehicle.findOne(query).populate(
        'customer',
        'name phone email address'
      )

      if (!vehicle) {
        return response.success(ctx, { exists: false })
      }

      // 返回车辆和客户信息
      response.success(ctx, {
        exists: true,
        vehicle,
        customer: vehicle.customer
      })
    } catch (error) {
      logger.error('检查车辆是否存在失败:', error)
      response.error(ctx, '检查车辆是否存在失败', 500, error.message)
    }
  }
}

module.exports = new RepairOrderController()
