const jwt = require('jsonwebtoken')
const response = require('../utils/response')
const User = require('../models/user')
const logger = require('../utils/logger')

/**
 * 认证中间件
 * @param {Object} ctx - Koa 上下文
 * @param {Function} next - 下一个中间件
 */
const auth = async (ctx, next) => {
  try {
    // 从请求头获取 token
    const authHeader = ctx.header.authorization
    if (!authHeader) {
      return response.error(ctx, '请提供认证令牌', 401)
    }

    // 确保 Authorization header 格式正确
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return response.error(ctx, '无效的认证令牌格式', 401)
    }

    const token = parts[1]

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) {
      return response.error(ctx, '无效的认证令牌', 401)
    }

    // 查找用户
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return response.error(ctx, '用户不存在', 401)
    }

    // 将用户信息添加到上下文
    ctx.state.user = user
    await next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      ctx.status = 401
      return response.error(ctx, '无效的认证令牌', 401)
    }
    if (error.name === 'TokenExpiredError') {
      ctx.status = 401
      return response.error(ctx, '认证令牌已过期', 401)
    }
    logger.error('认证失败:', error)
    ctx.status = 500
    return response.error(ctx, '认证失败', 500)
  }
}

module.exports = auth
