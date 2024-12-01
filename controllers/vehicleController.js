const Vehicle = require('../models/vehicle');
const Customer = require('../models/customer');

class VehicleController {
  /**
   * 创建新车辆
   * 同时更新客户的车辆列表
   */
  async createVehicle(ctx) {
    try {
      const { customerId, brand, model, year, licensePlate, vin, mileage } = ctx.request.body;

      // 检查客户是否存在
      const customer = await Customer.findById(customerId);
      if (!customer) {
        ctx.status = 404;
        ctx.body = { error: '客户不存在' };
        return;
      }

      const vehicle = new Vehicle({
        customer: customerId,
        brand,
        model,
        year,
        licensePlate,
        vin,
        mileage
      });

      await vehicle.save();

      // 更新客户的车辆列表
      customer.vehicles.push(vehicle._id);
      await customer.save();

      ctx.status = 201;
      ctx.body = vehicle;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '服务器错误' };
    }
  }

  /**
   * 获取所有车辆列表
   * 包含基本的客户信息
   */
  async getVehicles(ctx) {
    try {
      const vehicles = await Vehicle.find()
        .populate('customer', 'name phone')  // 只返回客户的姓名和电话
        .sort({ createdAt: -1 });  // 按创建时间降序排序
      ctx.body = vehicles;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '服务器错误' };
    }
  }

  /**
   * 根据ID获取车辆详情
   * 包含完整的客户信息
   */
  async getVehicleById(ctx) {
    try {
      const vehicle = await Vehicle.findById(ctx.params.id)
        .populate('customer');  // 关联查询完整的客户信息

      if (!vehicle) {
        ctx.status = 404;
        ctx.body = { error: '车辆不存在' };
        return;
      }

      ctx.body = vehicle;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '服务器错误' };
    }
  }

  /**
   * 更新车辆信息
   * @param {string} ctx.params.id - 车辆ID
   * @param {Object} ctx.request.body - 更新的车辆信息
   */
  async updateVehicle(ctx) {
    try {
      const { brand, model, year, licensePlate, vin, mileage } = ctx.request.body;

      const vehicle = await Vehicle.findByIdAndUpdate(
        ctx.params.id,
        { brand, model, year, licensePlate, vin, mileage },
        { new: true }
      );

      if (!vehicle) {
        ctx.status = 404;
        ctx.body = { error: '车辆不存在' };
        return;
      }

      ctx.body = vehicle;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '服务器错误' };
    }
  }

  /**
   * 删除车辆
   * 同时从客户的车辆列表中移除
   */
  async deleteVehicle(ctx) {
    try {
      const vehicle = await Vehicle.findById(ctx.params.id);
      if (!vehicle) {
        ctx.status = 404;
        ctx.body = { error: '车辆不存在' };
        return;
      }

      // 从客户的车辆列表中移除
      await Customer.findByIdAndUpdate(
        vehicle.customer,
        { $pull: { vehicles: vehicle._id } }  // 使用$pull操作符移除数组中的元素
      );

      await vehicle.deleteOne();
      ctx.body = { message: '车辆删除成功' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: '服务器错误' };
    }
  }
}

module.exports = new VehicleController(); 