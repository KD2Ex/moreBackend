const Router = require('express')
const router = new Router();
const controller = require('../controllers/imageController')

router.post('/add', controller.add)

module.exports = router;