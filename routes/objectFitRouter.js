const Router = require('express')
const router = new Router();
const controller = require('../controllers/objectFitController')

router.post('/', controller.add)

module.exports = router;