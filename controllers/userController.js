const User = require('../models/user');
const jwt = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const response = require('../utils/response');

class UserController {
  async register(ctx) {
    try {
      const { username, password, email } = ctx.request.body;

      // 检查用户是否已存在
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return response.error(ctx, '该邮箱已被注册', 10001);
      }

      // 创建新用户
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        email,
        password: hashedPassword
      });

      await user.save();
      ctx.status = 201;
      response.success(ctx, null, '注册成功');
    } catch (error) {
      throw error;
    }
  }

  async login(ctx) {
    try {
      const { email, password } = ctx.request.body;

      // 查找用户
      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError('用户名或密码错误', 401, 10002);
      }

      // 验证密码
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new AppError('用户名或密码错误', 401, 10002);
      }

      // 生成JWT令牌
      const token = jwt.sign({ id: user._id });
      response.success(ctx, { token });
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser(ctx) {
    try {
      const user = await User.findById(ctx.state.user.id).select('-password');
      response.success(ctx, user);
    } catch (error) {
      throw error;
    }
  }

  async updateCurrentUser(ctx) {
    try {
      const { username, email } = ctx.request.body;
      const userId = ctx.state.user.id;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { username, email },
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        throw new AppError('用户不存在', 404, 10003);
      }

      response.success(ctx, updatedUser, '用户信息更新成功');
    } catch (error) {
      throw error;
    }
  }

  /**
   * 修改密码
   * @param {Object} ctx - Koa上下文
   */
  async updatePassword(ctx) {
    try {
      const { currentPassword, newPassword } = ctx.request.body;
      const userId = ctx.state.user.id;

      // 获取用户信息（包含密码）
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('用户不存在', 404, 10003);
      }

      // 验证当前密码
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError('当前密码错误', 400, 10004);
      }

      // 检查新密码是否与当前密码相同
      if (currentPassword === newPassword) {
        throw new AppError('新密码不能与当前密码相同', 400, 10005);
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      user.password = hashedPassword;
      await user.save();

      response.success(ctx, null, '密码修改成功');
    } catch (error) {
      throw error;
    }
  }

  /**
   * 删除当前用户账户
   */
  async deleteCurrentUser(ctx) {
    try {
      const userId = ctx.state.user.id;

      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        throw new AppError('用户不存在', 404, 10003);
      }

      response.success(ctx, null, '账户删除成功');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserController(); 