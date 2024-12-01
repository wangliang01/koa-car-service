const Customer = require('../models/customer');
const response = require('../utils/response');
const AppError = require('../utils/AppError');
const errorCode = require('../config/errorCode');

class CustomerController {
  /**
   * 创建新客户
   * @param {Object} ctx - Koa上下文
   */
  async createCustomer(ctx) {
    try {
      const { name, phone, email, address } = ctx.request.body;

      const customer = new Customer({
        name,
        phone,
        email,
        address
      });

      await customer.save();
      ctx.status = 201;
      response.success(ctx, customer, '客户创建成功');
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取所有客户列表
   * 包含关联的车辆信息
   */
  async getCustomers(ctx) {
    try {
      const customers = await Customer.find()
        .populate('vehicles')
        .sort({ createdAt: -1 });
      response.success(ctx, customers);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 根据ID获取客户详情
   * 包含关联的车辆信息
   */
  async getCustomerById(ctx) {
    try {
      const customer = await Customer.findById(ctx.params.id)
        .populate('vehicles');

      if (!customer) {
        throw new AppError('客户不存在', 404, errorCode.CUSTOMER_NOT_FOUND);
      }

      response.success(ctx, customer);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 更新客户信息
   * @param {string} ctx.params.id - 客户ID
   * @param {Object} ctx.request.body - 更新的客户信息
   */
  async updateCustomer(ctx) {
    try {
      const { name, phone, email, address } = ctx.request.body;

      const customer = await Customer.findByIdAndUpdate(
        ctx.params.id,
        { name, phone, email, address },
        { new: true }
      );

      if (!customer) {
        throw new AppError('客户不存在', 404, errorCode.CUSTOMER_NOT_FOUND);
      }

      response.success(ctx, customer, '客户信息更新成功');
    } catch (error) {
      throw error;
    }
  }

  /**
   * 删除客户
   * @param {string} ctx.params.id - 客户ID
   */
  async deleteCustomer(ctx) {
    try {
      const customer = await Customer.findByIdAndDelete(ctx.params.id);

      if (!customer) {
        throw new AppError('客户不存在', 404, errorCode.CUSTOMER_NOT_FOUND);
      }

      response.success(ctx, null, '客户删除成功');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CustomerController(); 