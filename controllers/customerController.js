const Customer = require('../models/customer')
const response = require('../utils/response')
const AppError = require('../utils/AppError')
const errorCode = require('../config/errorCode')
const mongoose = require('mongoose')
const Vehicle = require('../models/vehicle')
const Appointment = require('../models/appointment')
const logger = require('../utils/logger')
const XLSX = require('xlsx')

class CustomerController {
  /**
   * 创建新客户
   * @param {Object} ctx - Koa上下文
   */
  async createCustomer(ctx) {
    try {
      const { name, phone, email, address } = ctx.request.body

      const customer = new Customer({
        name,
        phone,
        email,
        address
      })

      await customer.save()
      ctx.status = 201
      response.success(ctx, customer, '客户创建成功')
    } catch (error) {
      throw error
    }
  }

  /**
   * 获取客户列表（分页 + 模糊查询）
   * @param {Object} ctx - Koa上下文
   */
  async getCustomersByPage(ctx) {
    try {
      // 获取分页参数
      const current = parseInt(ctx.query.page) || 1
      const size = parseInt(ctx.query.size) || 10

      // 获取查询参数
      const { name, phone } = ctx.query

      // 验证分页参数
      if (current < 1 || size < 1) {
        return response.error(ctx, '无效的分页参数', 400)
      }

      // 构建查询条件
      const query = {}
      if (name) {
        query.name = { $regex: name, $options: 'i' }
      }
      if (phone) {
        query.phone = { $regex: phone, $options: 'i' }
      }

      // 计算跳过的文档数
      const skip = (current - 1) * size

      // 并行执行总数查询和分页数据查询
      const [total, records] = await Promise.all([
        Customer.countDocuments(query), // 使用相同的查询条件统计总数
        Customer.find(query)
          .populate('vehicles')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(size)
          .exec()
      ])

      response.success(ctx, {
        records,
        current,
        size,
        total
      })
    } catch (error) {
      logger.error('获取客户列表分页数据失败:', error)
      response.error(ctx, '获取客户列表分页数据失败', 500, error.message)
    }
  }

  /**
   * 获取客户列表（支持模糊查询）
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getCustomers(ctx) {
    try {
      // 从请求中获取查询参数
      const { name, phone } = ctx.query

      // 构建查询条件
      const query = {}
      if (name) {
        query.name = { $regex: name, $options: 'i' } // 客户名模糊查询，忽略大小写
      }
      if (phone) {
        query.phone = { $regex: phone, $options: 'i' } // 手机号模糊查询，忽略大小写
      }

      // 查询客户信息
      const customers = await Customer.find(query)
        .populate('vehicles')
        .sort({ createdAt: -1 })
        .exec()

      response.success(ctx, customers)
    } catch (error) {
      logger.error('获取客户列表失败:', error)
      response.error(ctx, '获取客户列表失败', 500, error.message)
    }
  }

  /**
   * 根据ID获取客户详情
   * 包含关联的车辆信息
   */
  /**
   * 根据ID获取客户详情
   * 包含关联的车辆信息
   * @param {Object} ctx - Koa上下文
   * @param {string} ctx.params.id - 客户ID
   */
  async getCustomerById(ctx) {
    try {
      const customerId = ctx.params.id

      // 验证客户ID是否有效
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return response.error(ctx, '无效的客户ID格式', 400)
      }

      // 查询客户信息并关联车辆数据
      const customer = await Customer.findById(customerId)
        .populate('vehicles')
        .exec()

      // 检查客户是否存在
      if (!customer) {
        return response.error(ctx, '未找到该客户信息', 404)
      }

      response.success(ctx, customer)
    } catch (error) {
      logger.error('获取客户详情失败:', error)
      response.error(ctx, '获取客户详情失败', 500, error.message)
    }
  }

  /**
   * 更新客户信息
   * @param {string} ctx.params.id - 客户ID
   * @param {Object} ctx.request.body - 更新的客户信息
   */
  async updateCustomer(ctx) {
    try {
      const { name, phone, email, address } = ctx.request.body

      const customer = await Customer.findByIdAndUpdate(
        ctx.params.id,
        { name, phone, email, address },
        { new: true }
      )

      if (!customer) {
        throw new AppError('客户不存在', 404, errorCode.CUSTOMER_NOT_FOUND)
      }

      response.success(ctx, customer, '客户信息更新成功')
    } catch (error) {
      throw error
    }
  }

  /**
   * 删除客户
   * @param {string} ctx.params.id - 客户ID
   */
  async deleteCustomer(ctx) {
    try {
      const customer = await Customer.findByIdAndDelete(ctx.params.id)

      if (!customer) {
        throw new AppError('客户不存在', 404, errorCode.CUSTOMER_NOT_FOUND)
      }

      response.success(ctx, null, '客户删除成功')
    } catch (error) {
      throw error
    }
  }

  /**
   * 获取客户的所有车辆
   * @param {Object} ctx - Koa上下文
   * @param {string} ctx.params.id - 客户ID
   */
  async getCustomerVehicles(ctx) {
    try {
      const customerId = ctx.params.id
      const vehicles = await Vehicle.find({ customer: customerId }).sort({
        createdAt: -1
      })
      response.success(ctx, vehicles)
    } catch (error) {
      logger.error('获取客户车辆列表失败:', error)
      response.error(ctx, '获取客户车辆列表失败', 500, error.message)
    }
  }

  /**
   * 获取客户的所有预约记录
   * @param {Object} ctx - Koa上下文
   * @param {string} ctx.params.id - 客户ID
   */
  async getCustomerAppointments(ctx) {
    try {
      const customerId = ctx.params.id
      const appointments = await Appointment.find({ customer: customerId })
        .populate('vehicle', 'brand model licensePlate')
        .sort({ appointmentDate: -1 })
      response.success(ctx, appointments)
    } catch (error) {
      logger.error('获取客户预约记录失败:', error)
      response.error(ctx, '获取客户预约记录失败', 500, error.message)
    }
  }

  /**
   * 批量导入客户
   * @param {Object} ctx - Koa上下文
   * @param {Array} ctx.request.body - 客户数据数组
   */
  async batchImportCustomers(ctx) {
    try {
      const customers = ctx.request.body
      if (!Array.isArray(customers)) {
        return response.error(ctx, '无效的数据格式', 400)
      }

      const result = await Customer.insertMany(customers, { ordered: false })
      response.success(ctx, result, '批量导入客户成功')
    } catch (error) {
      logger.error('批量导入客户失败:', error)
      response.error(ctx, '批量导入客户失败', 500, error.message)
    }
  }

  /**
   * 导出客户数据到Excel
   * @param {Object} ctx - Koa上下文
   */
  async exportCustomers(ctx) {
    try {
      // 查询客户数据
      const { name, phone, email, address } = ctx.query
      const query = {}
      if (name) query.name = { $regex: name, $options: 'i' }
      if (phone) query.phone = { $regex: phone, $options: 'i' }
      if (email) query.email = { $regex: email, $options: 'i' }
      if (address) query.address = { $regex: address, $options: 'i' }

      const customers = await Customer.find(query)
        .select('-__v')
        .populate('vehicles', 'brand model licensePlate')
        .lean()

      // 转换数据格式
      const excelData = customers.map((customer) => ({
        客户姓名: customer.name,
        联系电话: customer.phone,
        电子邮箱: customer.email || '',
        联系地址: customer.address || '',
        创建时间: new Date(customer.createdAt).toLocaleString('zh-CN'),
        车辆数量: customer.vehicles ? customer.vehicles.length : 0,
        车辆信息: customer.vehicles
          ? customer.vehicles
              .map((v) => `${v.brand} ${v.model} (${v.licensePlate})`)
              .join('; ')
          : ''
      }))

      // 创建工作簿
      const wb = XLSX.utils.book_new()

      // 将数据转换为工作表
      const ws = XLSX.utils.json_to_sheet(excelData, {
        header: [
          '客户姓名',
          '联系电话',
          '电子邮箱',
          '联系地址',
          '创建时间',
          '车辆数量',
          '车辆信息'
        ]
      })

      // 设置列宽
      ws['!cols'] = [
        { wch: 15 }, // 客户姓名
        { wch: 15 }, // 联系电话
        { wch: 25 }, // 电子邮箱
        { wch: 40 }, // 联系地址
        { wch: 20 }, // 创建时间
        { wch: 10 }, // 车辆数量
        { wch: 50 } // 车辆信息
      ]

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '客户列表')

      // 生成二进制数据
      const buffer = XLSX.write(wb, {
        type: 'buffer',
        bookType: 'xlsx',
        bookSST: false,
        compression: true
      })

      // 生成文件名
      const filename = `客户列表_${new Date()
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
      logger.error('导出客户数据失败:', error)
      response.error(ctx, '导出客户数据失败', 500, error.message)
    }
  }

  /**
   * 获取客户统计信息
   * @param {Object} ctx - Koa上下文
   */
  async getCustomerStats(ctx) {
    try {
      const [totalCustomers, totalVehicles, customerWithMostVehicles] =
        await Promise.all([
          Customer.countDocuments(), // 总客户数
          Vehicle.countDocuments(), // 总车辆数
          Customer.aggregate([
            // 拥有最多车辆的客户
            {
              $lookup: {
                from: 'vehicles',
                localField: '_id',
                foreignField: 'customer',
                as: 'vehicles'
              }
            },
            {
              $project: {
                name: 1,
                vehicleCount: { $size: '$vehicles' }
              }
            },
            { $sort: { vehicleCount: -1 } },
            { $limit: 1 }
          ])
        ])

      response.success(ctx, {
        totalCustomers,
        totalVehicles,
        averageVehiclesPerCustomer: totalCustomers
          ? (totalVehicles / totalCustomers).toFixed(2)
          : 0,
        customerWithMostVehicles: customerWithMostVehicles[0] || null
      })
    } catch (error) {
      logger.error('获取客户统计信息失败:', error)
      response.error(ctx, '获取客户统计信息失败', 500, error.message)
    }
  }
}

module.exports = new CustomerController()
