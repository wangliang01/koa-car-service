/**
 * 统一响应处理工具
 * 规范化所有接口的返回格式
 */

// 成功响应
const success = (ctx, data = null, message = '操作成功') => {
  ctx.status = 200
  ctx.body = {
    code: 0,
    message,
    data
  }
}

// 分页数据响应
const page = (ctx, { list, total, page, pageSize }) => {
  ctx.body = {
    code: 0,
    success: true,
    message: 'success',
    data: {
      list, // 列表数据
      pagination: {
        total, // 总条数
        page, // 当前页码
        pageSize // 每页条数
      }
    }
  }
}

// 错误响应
const error = (ctx, message = '操作失败', status = 500, error = null) => {
  ctx.status = status
  ctx.body = {
    code: 1,
    message,
    error: error ? error.toString() : null
  }
}

// 自定义响应
const custom = (
  ctx,
  { code = 0, success = true, message = '', data = null }
) => {
  ctx.body = {
    code,
    success,
    message,
    data
  }
}

module.exports = {
  success,
  page,
  error,
  custom
}
