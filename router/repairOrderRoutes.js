const Router = require('koa-router')
const auth = require('../middlewares/auth')
const repairOrderController = require('../controllers/repairOrderController')

const router = new Router({
  prefix: '/repair-order'
})

// 工单基础操作
router.post('/', auth, repairOrderController.createRepairOrder)
router.post('/isExist', auth, repairOrderController.isExist)
router.get('/vehicle', auth, repairOrderController.getVehicleByPlate)
router.get('/', auth, repairOrderController.getRepairOrders)
router.get('/:id', auth, repairOrderController.getRepairOrderById)

// 工单流程操作
router.patch('/:id/inspection', auth, repairOrderController.updateInspection)
router.patch('/:id/repair-items', auth, repairOrderController.updateRepairItems)
router.patch('/:id/status', auth, repairOrderController.updateStatus)

module.exports = router
