/**
 * 统一响应处理工具
 * 规范化所有接口的返回格式
 */

// 成功响应
const success = (ctx, data = null, message = 'success') => {
  ctx.body = {
    code: 0,           // 业务状态码
    success: true,     // 请求状态
    message,          // 响应信息
    data              // 响应数据
  };
};

// 分页数据响应
const page = (ctx, { list, total, page, pageSize }) => {
  ctx.body = {
    code: 0,
    success: true,
    message: 'success',
    data: {
      list,           // 列表数据
      pagination: {
        total,        // 总条数
        page,         // 当前页码
        pageSize     // 每页条数
      }
    }
  };
};

// 错误响应
const error = (ctx, message = 'error', code = -1, status = 400) => {
  ctx.status = status;
  ctx.body = {
    code,            // 业务状态码
    success: false,  // 请求状态
    message         // 错误信息
  };
};

// 自定义响应
const custom = (ctx, { code = 0, success = true, message = '', data = null }) => {
  ctx.body = {
    code,
    success,
    message,
    data
  };
};

module.exports = {
  success,
  page,
  error,
  custom
}; 