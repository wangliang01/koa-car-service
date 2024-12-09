const Appointment = require('../models/appointment')
const Customer = require('../models/customer')
const Vehicle = require('../models/vehicle')
const response = require('../utils/response')
const logger = require('../utils/logger')
const XLSX = require('xlsx')

class AppointmentController {
  /**
   * 创建新预约
   * 需要验证客户和车辆是否存在
   */
  async createAppointment(ctx) {
    try {
      const {
        customerId,
        vehicleId,
        appointmentDate,
        serviceType,
        description,
        remark
      } = ctx.request.body

      // 验证客户和车辆是否存在
      const customer = await Customer.findById(customerId)
      const vehicle = await Vehicle.findById(vehicleId)

      if (!customer || !vehicle) {
        return response.error(ctx, '客户或车辆不存在', 404)
      }

      const appointment = new Appointment({
        customer: customerId,
        vehicle: vehicleId,
        appointmentDate,
        serviceType,
        description,
        remark
      })

      await appointment.save()
      ctx.status = 201
      response.success(ctx, appointment, '预约创建成功')
    } catch (error) {
      logger.error('创建预约失败:', error)
      response.error(ctx, '创建预约失败', 500, error.message)
    }
  }

  /**
   * 获取所有预约列表
   */
  async getAppointments(ctx) {
    try {
      const appointments = await Appointment.find()
        .populate('customer', 'name phone')
        .populate('vehicle', 'brand model licensePlate')
        .sort({ appointmentDate: 1 })
      response.success(ctx, appointments)
    } catch (error) {
      logger.error('获取预约列表失败:', error)
      response.error(ctx, '获取预约列表失败', 500, error.message)
    }
  }

  /**
   * 根据ID获取预约详情
   */
  async getAppointmentById(ctx) {
    try {
      const appointment = await Appointment.findById(ctx.params.id)
        .populate('customer')
        .populate('vehicle')

      if (!appointment) {
        return response.error(ctx, '预约不存在', 404)
      }

      response.success(ctx, appointment)
    } catch (error) {
      logger.error('获取预约详情失败:', error)
      response.error(ctx, '获取预约详情失败', 500, error.message)
    }
  }

  /**
   * 更新预约信息
   */
  async updateAppointment(ctx) {
    try {
      const { appointmentDate, serviceType, description, remark } =
        ctx.request.body

      const appointment = await Appointment.findByIdAndUpdate(
        ctx.params.id,
        { appointmentDate, serviceType, description, remark },
        { new: true }
      )

      if (!appointment) {
        return response.error(ctx, '预约不存在', 404)
      }

      response.success(ctx, appointment, '预约更新成功')
    } catch (error) {
      logger.error('更新预约失败:', error)
      response.error(ctx, '更新预约失败', 500, error.message)
    }
  }

  /**
   * 更新预约状态
   */
  async updateAppointmentStatus(ctx) {
    try {
      const { status } = ctx.request.body

      const appointment = await Appointment.findByIdAndUpdate(
        ctx.params.id,
        { status },
        { new: true }
      )

      if (!appointment) {
        return response.error(ctx, '预约不存在', 404)
      }

      response.success(ctx, appointment, '预约状态更新成功')
    } catch (error) {
      logger.error('更新预约状态失败:', error)
      response.error(ctx, '更新预约状态失败', 500, error.message)
    }
  }

  /**
   * 删除预约
   */
  async deleteAppointment(ctx) {
    try {
      const appointment = await Appointment.findByIdAndDelete(ctx.params.id)

      if (!appointment) {
        return response.error(ctx, '预约不存在', 404)
      }

      response.success(ctx, null, '预约删除成功')
    } catch (error) {
      logger.error('删除预约失败:', error)
      response.error(ctx, '删除预约失败', 500, error.message)
    }
  }

  /**
   * 获取预约列表（分页）
   */
  async getAppointmentsByPage(ctx) {
    try {
      const current = parseInt(ctx.query.page) || 1
      const size = parseInt(ctx.query.size) || 10
      const { status, serviceType } = ctx.query

      if (current < 1 || size < 1) {
        return response.error(ctx, '无效的分页参数', 400)
      }

      const query = {}
      if (status) query.status = status
      if (serviceType) query.serviceType = serviceType

      const skip = (current - 1) * size

      const [total, records] = await Promise.all([
        Appointment.countDocuments(query),
        Appointment.find(query)
          .populate('customer', 'name phone')
          .populate('vehicle', 'brand model licensePlate')
          .sort({ appointmentDate: -1 })
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
      logger.error('获取预约列表失败:', error)
      response.error(ctx, '获取预约列表失败', 500, error.message)
    }
  }

  /**
   * 取消预约
   * @param {Object} ctx - Koa上下文
   */
  async cancelAppointment(ctx) {
    try {
      const { id } = ctx.params
      const { cancelReason } = ctx.request.body

      // 查找并更新预约状态
      const appointment = await Appointment.findByIdAndUpdate(
        id,
        {
          status: 'cancelled',
          cancelReason // 需要在Schema中添加这个字段
        },
        { new: true }
      )

      if (!appointment) {
        return response.error(ctx, '预约不存在', 404)
      }

      response.success(ctx, appointment, '预约已取消')
    } catch (error) {
      logger.error('取消预约失败:', error)
      response.error(ctx, '取消预约失败', 500, error.message)
    }
  }

  /**
   * 获取今日预约列表
   * @param {Object} ctx - Koa上下文
   */
  async getTodayAppointments(ctx) {
    try {
      // 获取今天的开始和结束时间
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0))
      const endOfDay = new Date(today.setHours(23, 59, 59, 999))

      const appointments = await Appointment.find({
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      })
        .populate('customer', 'name phone')
        .populate('vehicle', 'brand model licensePlate')
        .sort({ appointmentDate: 1 })

      response.success(ctx, appointments)
    } catch (error) {
      logger.error('获取今日预约列表失败:', error)
      response.error(ctx, '获取今日预约列表失败', 500, error.message)
    }
  }

  /**
   * 获取指定日期范围的预约列表
   * @param {Object} ctx - Koa上下文
   */
  async getAppointmentsByDateRange(ctx) {
    try {
      const { startDate, endDate } = ctx.query

      // 验证日期参数
      if (!startDate || !endDate) {
        return response.error(ctx, '请提供开始和结束日期', 400)
      }

      // 转换为Date对象
      const start = new Date(startDate)
      const end = new Date(endDate)

      // 验证日期有效性
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return response.error(ctx, '无效的日期格式', 400)
      }

      // 确保开始日期不晚于结束日期
      if (start > end) {
        return response.error(ctx, '开始日期不能晚于结束日期', 400)
      }

      const appointments = await Appointment.find({
        appointmentDate: {
          $gte: start,
          $lte: end
        }
      })
        .populate('customer', 'name phone')
        .populate('vehicle', 'brand model licensePlate')
        .sort({ appointmentDate: 1 })

      response.success(ctx, appointments)
    } catch (error) {
      logger.error('获取日期范围预约列表失败:', error)
      response.error(ctx, '获取日期范围预约列表失败', 500, error.message)
    }
  }

  /**
   * 获取预约统计信息
   * @param {Object} ctx - Koa上下文
   */
  async getAppointmentStats(ctx) {
    try {
      // 获取今天的开始和结束时间
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0))
      const endOfDay = new Date(today.setHours(23, 59, 59, 999))

      // 并行执行多个统计查询
      const [
        totalAppointments,
        todayAppointments,
        statusStats,
        serviceTypeStats,
        monthlyStats
      ] = await Promise.all([
        // 总预约数
        Appointment.countDocuments(),

        // 今日预约数
        Appointment.countDocuments({
          appointmentDate: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }),

        // 各状态预约数量统计
        Appointment.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),

        // 各服务类型预约数量统计
        Appointment.aggregate([
          { $group: { _id: '$serviceType', count: { $sum: 1 } } }
        ]),

        // 最近6个月的预约趋势
        Appointment.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$appointmentDate' },
                month: { $month: '$appointmentDate' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 6 }
        ])
      ])

      response.success(ctx, {
        total: totalAppointments,
        today: todayAppointments,
        statusStats: statusStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count
          return acc
        }, {}),
        serviceTypeStats: serviceTypeStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count
          return acc
        }, {}),
        monthlyTrend: monthlyStats.reverse()
      })
    } catch (error) {
      logger.error('获取预约统计信息失败:', error)
      response.error(ctx, '获取预约统计信息失败', 500, error.message)
    }
  }

  /**
   * 批量导入预约
   * @param {Object} ctx - Koa上下文
   */
  async batchImportAppointments(ctx) {
    try {
      const appointments = ctx.request.body

      if (!Array.isArray(appointments)) {
        return response.error(ctx, '无效的数据格式', 400)
      }

      // 验证所有客户和车辆是否存在
      const customerIds = [...new Set(appointments.map((a) => a.customerId))]
      const vehicleIds = [...new Set(appointments.map((a) => a.vehicleId))]

      const [customers, vehicles] = await Promise.all([
        Customer.find({ _id: { $in: customerIds } }),
        Vehicle.find({ _id: { $in: vehicleIds } })
      ])

      // 创建ID映射以便快速查找
      const customerMap = new Map(customers.map((c) => [c._id.toString(), c]))
      const vehicleMap = new Map(vehicles.map((v) => [v._id.toString(), v]))

      // 验证并格式化预约数据
      const validAppointments = appointments.map((appointment) => {
        const {
          customerId,
          vehicleId,
          appointmentDate,
          serviceType,
          description,
          remark
        } = appointment

        if (!customerMap.has(customerId)) {
          throw new Error(`客户ID ${customerId} 不存在`)
        }
        if (!vehicleMap.has(vehicleId)) {
          throw new Error(`车辆ID ${vehicleId} 不存在`)
        }

        return {
          customer: customerId,
          vehicle: vehicleId,
          appointmentDate,
          serviceType,
          description,
          remark,
          status: 'pending'
        }
      })

      // 批量创建预约
      const result = await Appointment.insertMany(validAppointments, {
        ordered: false // 允许部分成功
      })

      response.success(ctx, result, '批量导入预约成功')
    } catch (error) {
      logger.error('批量导入预约失败:', error)
      response.error(ctx, '批量导入预约失败: ' + error.message, 500)
    }
  }

  /**
   * 导出预约数据
   * @param {Object} ctx - Koa上下文
   */
  async exportAppointments(ctx) {
    try {
      // 获取查询参数
      const { startDate, endDate, status, serviceType } = ctx.query

      // 构建查询条件
      const query = {}
      if (startDate && endDate) {
        query.appointmentDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
      if (status) query.status = status
      if (serviceType) query.serviceType = serviceType

      // 获取预约数据并关联查询
      const appointments = await Appointment.find(query)
        .populate('customer', 'name phone')
        .populate('vehicle', 'brand model licensePlate')
        .sort({ appointmentDate: -1 })
        .lean()

      // 转换数据格式
      const excelData = appointments.map((appointment) => ({
        预约日期: new Date(appointment.appointmentDate).toLocaleString('zh-CN'),
        客户姓名: appointment.customer?.name || '',
        联系电话: appointment.customer?.phone || '',
        车辆品牌: appointment.vehicle?.brand || '',
        车辆型号: appointment.vehicle?.model || '',
        车牌号: appointment.vehicle?.licensePlate || '',
        服务类型: (() => {
          const map = {
            maintenance: '保养',
            repair: '维修',
            inspection: '检查',
            other: '其他'
          }
          return map[appointment.serviceType] || appointment.serviceType
        })(),
        预约状态: (() => {
          const map = {
            pending: '待确认',
            confirmed: '已确认',
            completed: '已完成',
            cancelled: '已取消'
          }
          return map[appointment.status] || appointment.status
        })(),
        服务描述: appointment.description || '',
        备注: appointment.remark || '',
        取消原因: appointment.cancelReason || '',
        创建时间: new Date(appointment.createdAt).toLocaleString('zh-CN'),
        更新时间: new Date(appointment.updatedAt).toLocaleString('zh-CN')
      }))

      // 创建工作簿
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)

      // 设置列宽
      ws['!cols'] = [
        { wch: 20 }, // 预约日期
        { wch: 15 }, // 客户姓名
        { wch: 15 }, // 联系电话
        { wch: 15 }, // 车辆品牌
        { wch: 15 }, // 车辆型号
        { wch: 12 }, // 车牌号
        { wch: 10 }, // 服务类型
        { wch: 10 }, // 预约状态
        { wch: 30 }, // 服务描述
        { wch: 30 }, // 备注
        { wch: 20 }, // 取消原因
        { wch: 20 }, // 创建时间
        { wch: 20 } // 更新时间
      ]

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '预约列表')

      // 生成二进制数据
      const buffer = XLSX.write(wb, {
        type: 'buffer',
        bookType: 'xlsx',
        cellStyles: true,
        compression: true
      })

      // 生成文件名
      const filename = `预约列表_${new Date()
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
      logger.error('导出预约数据失败:', error)
      response.error(ctx, '导出预约数据失败', 500, error.message)
    }
  }

  // 获取服务类型中文描述
  getServiceTypeText(type) {
    const map = {
      maintenance: '保养',
      repair: '维修',
      inspection: '检查',
      other: '其他'
    }
    return map[type] || type
  }

  // 获取状态中文描述
  getStatusText(status) {
    const map = {
      pending: '待确认',
      confirmed: '已确认',
      completed: '已完成',
      cancelled: '已取消'
    }
    return map[status] || status
  }
}

module.exports = new AppointmentController()
