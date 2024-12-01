const Appointment = require('../models/appointment');
const Customer = require('../models/customer');
const Vehicle = require('../models/vehicle');

class AppointmentController {
  /**
   * 创建新预约
   * 需要验证客户和车辆是否存在
   */
  async createAppointment(ctx) {
    try {
      const { customerId, vehicleId, appointmentDate, serviceType, description, notes } = ctx.request.body;

      // 验证客户和车辆是否存在
      const customer = await Customer.findById(customerId);
      const vehicle = await Vehicle.findById(vehicleId);

      if (!customer || !vehicle) {
        ctx.status = 404;
        ctx.body = { error: '客户或车辆不存在' };
        return;
      }

      const appointment = new Appointment({
        customer: customerId,
        vehicle: vehicleId,
        appointmentDate,
        serviceType,
        description,
        notes
      });

      await appointment.save();
      ctx.status = 201;
      ctx.body = appointment;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '服务器错误' };
    }
  }

  /**
   * 获取所有预约列表
   * 包含客户和车辆的基本信息
   * 按预约时间升序排序
   */
  async getAppointments(ctx) {
    try {
      const appointments = await Appointment.find()
        .populate('customer', 'name phone')  // 只返回客户的姓名和电话
        .populate('vehicle', 'brand model licensePlate')  // 只返回车辆的基本信息
        .sort({ appointmentDate: 1 });  // 按预约时间升序排序
      ctx.body = appointments;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '服务器错误' };
    }
  }

  /**
   * 根据ID获取预约详情
   * 包含完整的客户和车辆信息
   */
  async getAppointmentById(ctx) {
    try {
      const appointment = await Appointment.findById(ctx.params.id)
        .populate('customer')  // 关联查询完整的客户信息
        .populate('vehicle');  // 关联查询完整的车辆信息

      if (!appointment) {
        ctx.status = 404;
        ctx.body = { error: '预约不存在' };
        return;
      }

      ctx.body = appointment;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '服务器错误' };
    }
  }

  /**
   * 更新预约信息
   * @param {string} ctx.params.id - 预约ID
   * @param {Object} ctx.request.body - 更新的预约信息
   */
  async updateAppointment(ctx) {
    try {
      const { appointmentDate, serviceType, description, notes } = ctx.request.body;

      const appointment = await Appointment.findByIdAndUpdate(
        ctx.params.id,
        { appointmentDate, serviceType, description, notes },
        { new: true }
      );

      if (!appointment) {
        ctx.status = 404;
        ctx.body = { error: '预约不存在' };
        return;
      }

      ctx.body = appointment;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '服务器错误' };
    }
  }

  /**
   * 更新预约状态
   * 用于处理预约的确认、完成、取消等状态变更
   */
  async updateAppointmentStatus(ctx) {
    try {
      const { status } = ctx.request.body;

      const appointment = await Appointment.findByIdAndUpdate(
        ctx.params.id,
        { status },
        { new: true }
      );

      if (!appointment) {
        ctx.status = 404;
        ctx.body = { error: '预约不存在' };
        return;
      }

      ctx.body = appointment;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '服务器错误' };
    }
  }

  /**
   * 删除预约
   * @param {string} ctx.params.id - 预约ID
   */
  async deleteAppointment(ctx) {
    try {
      const appointment = await Appointment.findByIdAndDelete(ctx.params.id);

      if (!appointment) {
        ctx.status = 404;
        ctx.body = { error: '预约不存在' };
        return;
      }

      ctx.body = { message: '预约删除成功' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '服务器错误' };
    }
  }
}

module.exports = new AppointmentController(); 