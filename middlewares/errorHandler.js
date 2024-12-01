const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const response = require('../utils/response');

/**
 * 全局错误处理中间件
 * 区分开发环境和生产环境的错误处理
 * 区分业务错误和系统错误
 */
const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // 获取环境变量
    const isDev = process.env.NODE_ENV === 'development';

    // 如果是开发环境且不是业务错误，直接抛出
    if (isDev && !(err instanceof AppError)) {
      throw err;
    }

    // 记录错误日志
    logger.error('错误详情:', {
      error: err.message,
      code: err.code,
      stack: err.stack,
      url: ctx.request.url,
      method: ctx.request.method,
      body: ctx.request.body,
      query: ctx.request.query,
      params: ctx.params
    });

    // 区分已知和未知错误
    if (err instanceof AppError) {
      // 已知的业务错误，使用统一响应格式
      response.error(ctx, err.message, err.code, err.status);
    } else {
      // 未知的系统错误
      response.error(ctx, '服务器内部错误', -1, 500);
    }

    console.error(err)

    // 触发应用级错误事件
    ctx.app.emit('error', err, ctx);
  }
};

module.exports = errorHandler; 