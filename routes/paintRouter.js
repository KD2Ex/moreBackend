const Router = require('express')
const router = new Router();
const controller = require('../controllers/paintController')


router.post('/', controller.create)
router.post('/localeData', controller.createLocaleData)
router.post('/update/localeData', controller.updateLocaleData)
router.post('/update', controller.updateAllSizes)
router.post('/update/:id', controller.updatePainting)
router.post('/updateOrder', controller.updateOrder)
router.get('/', controller.getAll)
router.get('/filteredCount', controller.getFilteredCount)
//router.get('/:id', controller.getOne)
router.delete('/:id', controller.delete)
router.delete('/', controller.deleteAll)




module.exports = router;