const Router = require('express')
const router = new Router();
const controller = require('../controllers/projectImageController')

router.delete('/', controller.delete)

module.exports = router;


