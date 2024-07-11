const ApiError = require('../error/ApiError')
const {Project, ProjectImage} = require("../models/models");
const PaintingUtils = require('../utils/paintingUtils')
const fs = require("node:fs");
const path = require("path");


class ProjectController {

    async create(req, res, next) {

        try {

            const {
                title,
                desc,
                cost,
                levels,
                area,
                timePeriod,
                address
            } = req.body
            const {images} = req.files;

            let order = await Project.max('order');
            ++order;

            const project = await Project.create({
                title,
                desc,
                cost,
                levels,
                area,
                timePeriod,
                address,
                order
            })

            const createdImages = await PaintingUtils
                .addImg(images, project.id, 0, ProjectImage, "project")

            const result = JSON.parse(JSON.stringify(project))
            result.images = createdImages

            return res.json(result);

        } catch (e) {

            return next(ApiError.badRequest(e.message))

        }
    }

    async getAll(req, res, next) {
        try {

            let {page, limit} = req.query
            const { count, rows } = await Project.findAndCountAll(
                {
                    include: [
                        {
                            model: ProjectImage, as: 'images',
                            attributes: ['name', 'order']
                        }
                    ],
                    order: [
                        ['order', 'ASC']
                    ]
                }
            )

            const resultRows = JSON
                .parse(JSON
                    .stringify(rows
                        .slice(page * limit - limit, limit * page)))

            const result = {
                items: resultRows,
                totalPages: Math.ceil(count / limit),
            }

            for (const proj of result.items) {
                proj.images.sort((a, b) => a.order - b.order)
            }

            res.json(result)

        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }


    async update(req, res, next) {
        try {

            const {
                id,
                title,
                desc,
                levels,
                area,
                timePeriod,
                address
            } = req.body

            let images = null

            if (req.files) {
                images = req.files.images
            }

            const project = await Project.findByPk(id, {
                include: [
                    {
                        model: ProjectImage,
                        as: 'images',
                        attributes: ['name', 'order']
                    }
                ]
            })

            project.set({
                title,
                desc,
                levels,
                area,
                timePeriod,
                address
            })

            const json = JSON.parse(JSON.stringify(project));

            let resultImages = []

            if (images) {
                const maxImagesOrder = Math.max(...json.images.map(i => i.order))

                resultImages = await PaintingUtils
                    .addImg(images, id, maxImagesOrder + 1, ProjectImage, "project")

            }

            await project.save();

            return res.status(200).json(resultImages)

        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async updateOrder(req, res, next) {
        try {

            const items = req.body;

            for (let i of items) {
                await Project.update({order: i.order}, {
                    where: {
                        id: i.id
                    }
                })
            }

            return res.status(200).json('ok')

        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async delete(req, res, next) {
        try {

            const {id} = req.params

            if (!id) {
                return next(ApiError.badRequest('id is required'))
            }

            const images = await ProjectImage.findAll({
                where: {projectId: id}
            })

            images.forEach(i => {
                fs.unlink(path.resolve(__dirname, '..', 'static', i.name), (err) => {
                    if (err) throw err;
                    console.log('file was deleted')
                })
            })

            await ProjectImage.destroy({
                where: {projectId: id}
            })

            await Project.destroy({
                where: {id}
            })

            return res.status(200).json('deleted')

        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }
    async deleteAll(req, res, next) {
        try {

        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async updateHeight(req, res, next) {
        try {

            const items = req.body;

            for (let i of items) {
                await Project.update({height: i.height }, {
                    where: {
                        id: i.id
                    }
                })
            }

        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new ProjectController()