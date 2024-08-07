const Router = require('express')
const router = new Router();
const paintRouter = require('./paintRouter')
const userRouter = require('./userRouter')
const imageRouter = require('./imageRouter')
const objectFitRouter = require('./objectFitRouter')
const techniqueRouter = require('./techniqueRouter')
const materialRouter = require('./materialRouter')
const projectRouter = require('./projectRouter')
const projectImageRouter = require('./projectImageRouter')
const localeTextRouter = require('./localeRouter')
const postRouter = require('./postRouter')

router.use('/user', userRouter)
router.use('/paint', paintRouter)
router.use('/image', imageRouter)
router.use('/fit', objectFitRouter)
router.use('/material', materialRouter)
router.use('/technique', techniqueRouter)
router.use('/project', projectRouter)
router.use('/projectImage', projectImageRouter)
router.use('/locale', localeTextRouter)
router.use('/post', postRouter)

module.exports = router

