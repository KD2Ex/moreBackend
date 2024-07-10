const Router = require('express')
const router = new Router();
const controller = require('../controllers/projectController')


router.post('/', controller.create)
//router.post('/update', controller.updateAllSizes)
router.post('/update/:id', controller.update)
router.post('/updateOrder', controller.updateOrder)
router.post('/updateHeight', controller.updateHeight)
router.get('/', controller.getAll)
router.delete('/:id', controller.delete)
router.delete('/', controller.deleteAll)

module.exports = router;