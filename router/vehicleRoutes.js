const Router = require('koa-router');
const auth = require('../middlewares/auth');
const vehicleController = require('../controllers/vehicleController');

const router = new Router({
  prefix: '/vehicles'
});

router.post('/', auth, vehicleController.createVehicle);
router.get('/', auth, vehicleController.getVehicles);
router.get('/:id', auth, vehicleController.getVehicleById);
router.put('/:id', auth, vehicleController.updateVehicle);
router.delete('/:id', auth, vehicleController.deleteVehicle);

module.exports = router; 