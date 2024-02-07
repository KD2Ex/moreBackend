const Router = require('express')
const router = new Router();
const controller = require('../controllers/materialController')

router.post('/', controller.create)
router.get('/', controller.getAll)
router.delete('/:id', controller.delete)


module.exports = router;