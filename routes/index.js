const Router = require('express')
const router = new Router();
const paintRouter = require('./paintRouter')
const userRouter = require('./userRouter')
const imageRouter = require('./imageRouter')
const objectFitRouter = require('./objectFitRouter')

router.use('/user', userRouter)
router.use('/paint', paintRouter)
router.use('/image', imageRouter)
router.use('/fit', objectFitRouter)

module.exports = router