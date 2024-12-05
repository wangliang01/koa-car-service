require('dotenv').config()
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
  override: true
})
const Koa = require('koa')
const cors = require('@koa/cors')
const { koaBody } = require('koa-body')
const router = require('./router/index')
const logger = require('./utils/logger')
const connectDB = require('./config/database')
const errorHandler = require('./middlewares/errorHandler')

const app = new Koa()

// 错误处理
// app.on('error', (err, ctx) => {
//     // 这里只处理未被错误中间件捕获的错误
//     logger.error('未捕获的错误:', {
//         error: err.message,
//         url: ctx.request.url,
//         method: ctx.request.method
//     });
// });

// 注册中间件
app.use(errorHandler) // 错误处理中间件放在最前面

// 请求日志中间件
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  logger.http(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

app.use(cors())
app.use(koaBody({ multipart: true }))
app.use(router.routes()).use(router.allowedMethods())

// 连接数据库
connectDB()

const PORT = process.env.HTTP_PORT || 3000

const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    logger.info(`服务器运行在 ${PORT} 端口 [${process.env.NODE_ENV}环境]`)
  }
})

module.exports = server
