const Router = require('express')
const router = new Router();
const controller = require('../controllers/paintController')


router.post('/', controller.create)
router.post('/update', controller.updateAllSizes)
router.post('/update/:id', controller.updatePainting)
router.get('/', controller.getAll)
router.get('/:id', controller.getOne)
router.delete('/:id', controller.delete)
router.delete('/', controller.deleteAll)


module.exports = router;