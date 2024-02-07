const Router = require('express')
const router = new Router();
const controller = require('../controllers/imageController')

router.post('/add', controller.add)
router.delete('/', controller.deleteOne)

module.exports = router;