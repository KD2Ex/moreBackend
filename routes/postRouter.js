const Router = require('express')
const router = new Router();
const controller = require('../controllers/postController')

router.post('/', controller.create)
router.post('/addImage/:id', controller.addImage)
router.post('/test', controller.blobTest)
router.post('/update/:id', controller.update)
router.get('/', controller.getAll)
router.get('/:id', controller.getOne)
router.delete('/:id', controller.delete)

module.exports = router;