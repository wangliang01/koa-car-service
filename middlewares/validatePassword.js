const AppError = require('../utils/AppError');
const response = require('../utils/response');

/**
 * 密码验证中间件
 * 检查密码是否符合要求：
 * 1. 长度至少8位
 * 2. 包含至少一个大写字母
 * 3. 包含至少一个小写字母
 * 4. 包含至少一个数字
 * @param {Object} ctx - Koa上下文
 * @param {Function} next - 下一个中间件
 */
const validatePassword = async (ctx, next) => {
  try {
    const { newPassword } = ctx.request.body;

    if (!newPassword) {
      return response.error(ctx, '新密码不能为空', 10008);
    }

    // 密码长度验证
    if (newPassword.length < 8) {
      return response.error(ctx, '密码长度至少为8位', 10006);
    }

    // 密码复杂度验证
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return response.error(
        ctx,
        '密码必须包含大写字母、小写字母和数字',
        10007
      );
    }

    await next();
  } catch (error) {
    // 使用统一的响应处理
    return response.error(ctx, error.message, error.code || 500);
  }
};

module.exports = validatePassword; 