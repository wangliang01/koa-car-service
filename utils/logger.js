const winston = require('winston');
const path = require('path');

// 定义日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 根据环境选择日志级别
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// 定义日志颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// 添加颜色
winston.addColors(colors);

// 定义日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// 定义日志输出目标
const transports = [
  // 控制台输出
  new winston.transports.Console(),
  // 记录所有日志
  new winston.transports.File({
    filename: path.join('logs', 'all.log'),
  }),
  // 记录错误日志
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
  }),
];

// 创建日志实例
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

module.exports = logger; 