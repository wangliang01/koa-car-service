// 创建数据库
db = db.getSiblingDB('car_service_dev')

// 创建集合
db.createCollection('users')
db.createCollection('customers')
db.createCollection('vehicles')
db.createCollection('repairOrders')

// 创建索引
db.users.createIndex({ email: 1 }, { unique: true })
db.vehicles.createIndex({ licensePlate: 1 }, { unique: true })
db.vehicles.createIndex({ vin: 1 }, { unique: true })
db.repairOrders.createIndex({ orderNo: 1 }, { unique: true })
