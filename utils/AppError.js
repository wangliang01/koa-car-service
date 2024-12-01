/**
 * 应用自定义错误类
 * 用于区分已知业务错误和未知系统错误
 */
class AppError extends Error {
  constructor(message, status = 500, code = 'UNKNOWN_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
    this.isOperational = true; // 标记为已知的操作型错误
  }
}

module.exports = AppError; 