const jwt = require('jsonwebtoken');
const ResponseHandler = require('../utils/response');
const User = require('../models/user');

/**
 * 认证中间件
 * @param {Object} ctx - Koa 上下文
 * @param {Function} next - 下一个中间件
 */
const auth = async (ctx, next) => {
  try {
    // 从请求头获取 token
    const token = ctx.header.authorization?.split(' ')[1];

    if (!token) {
      return ResponseHandler.unauthorized(ctx, '请提供认证令牌');
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 查找用户
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return ResponseHandler.unauthorized(ctx, '用户不存在');
    }

    // 将用户信息添加到上下文
    ctx.state.user = user;
    console.log('auth next')
    await next();
    
  } catch (error) {
    ResponseHandler.unauthorized(ctx, '无效的认证令牌');
  }
};

module.exports = auth; 