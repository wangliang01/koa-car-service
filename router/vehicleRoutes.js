const Router = require('koa-router')
const auth = require('../middlewares/auth')
const vehicleController = require('../controllers/vehicleController')

const router = new Router({
  prefix: '/vehicle'
})

// 特殊查询路由（需要放在 /:id 路由之前）
router.get('/by-plate', auth, vehicleController.getVehicleByPlate)
router.get('/page', auth, vehicleController.getVehiclesByPage)
router.get('/export', auth, vehicleController.exportVehicles)
router.get('/stats', auth, vehicleController.getVehicleStats)
router.get('/brands', auth, vehicleController.getVehicleBrands)
router.get('/models', auth, vehicleController.getVehicleModels)

// 批量操作路由
router.post('/batch-import', auth, vehicleController.batchImportVehicles)
router.post('/batch-delete', auth, vehicleController.batchDeleteVehicles)

// 车辆ID相关路由（放在最后）
router.patch('/:id/mileage', auth, vehicleController.updateVehicleMileage)
router.post('/', auth, vehicleController.createVehicle)
router.get('/', auth, vehicleController.getVehicles)
router.get('/:id', auth, vehicleController.getVehicleById)
router.put('/:id', auth, vehicleController.updateVehicle)
router.delete('/:id', auth, vehicleController.deleteVehicle)

module.exports = router
