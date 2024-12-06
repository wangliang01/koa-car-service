const Router = require('koa-router')
const auth = require('../middlewares/auth')
const vehicleController = require('../controllers/vehicleController')

const router = new Router({
  prefix: '/vehicle'
})

router.get('/page', auth, vehicleController.getVehiclesByPage)
router.get('/export', auth, vehicleController.exportVehicles)
router.get('/stats', auth, vehicleController.getVehicleStats)
router.get('/brands', auth, vehicleController.getVehicleBrands)
router.get('/models', auth, vehicleController.getVehicleModels)
router.post('/batch-import', auth, vehicleController.batchImportVehicles)

// 车辆ID相关路由
// router.get('/:id/repairs', auth, vehicleController.getVehicleRepairRecords)
// router.get('/:id/appointments', auth, vehicleController.getVehicleAppointments)
router.patch('/:id/mileage', auth, vehicleController.updateVehicleMileage)
router.post('/', auth, vehicleController.createVehicle)
router.get('/', auth, vehicleController.getVehicles)
router.get('/:id', auth, vehicleController.getVehicleById)
router.put('/:id', auth, vehicleController.updateVehicle)
router.delete('/:id', auth, vehicleController.deleteVehicle)

module.exports = router
