const Router = require('express')
const router = new Router();
const controller = require('../controllers/localeController')

router.get('/', controller.getAll)

module.exports = router;