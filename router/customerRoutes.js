const Router = require('koa-router');
const auth = require('../middlewares/auth');
const customerController = require('../controllers/customerController');

const router = new Router({
  prefix: '/customers'
});

router.post('/', auth, customerController.createCustomer);
router.get('/', auth, customerController.getCustomers);
router.get('/:id', auth, customerController.getCustomerById);
router.put('/:id', auth, customerController.updateCustomer);
router.delete('/:id', auth, customerController.deleteCustomer);

module.exports = router; 