const ApiError = require('../error/ApiError')
const {Project, ProjectImage, Locale, LocaleTextProject, LocaleTextPainting} = require("../models/models");
const PaintingUtils = require('../utils/paintingUtils')
const fs = require("node:fs");
const path = require("path");
const Utilities = require('../utils/utilities')


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

            const locales = await Locale.findAll();
            const [localeTitles, localeDesc, localeCost, localeTimePeriod, localeAddress] =
                Utilities.extractLocaleObjects([title, desc, cost, timePeriod, address])

            const project = await Project.create({
                title,
                desc,
                cost: 0,
                levels,
                area,
                timePeriod,
                address,
                order,
                height: 400
            })

            const createdImages = await PaintingUtils
                .addImg(images, project.id, 0, ProjectImage, "project")

            for (const locale of locales) {
                await LocaleTextProject.create({
                    projectId: project.id,
                    localeId: locale.id,
                    title: localeTitles[locale.name],
                    desc: localeDesc[locale.name],
                    cost: localeCost[locale.name],
                    timePeriod: localeTimePeriod[locale.name],
                    address: localeTimePeriod[locale.name],
                })
            }

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

            const locales = await Locale.findAll();

            const localeMap = {};
            for (const item of locales) {
                localeMap[item.id] = item.name
            }

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

                const localeNames = await LocaleTextProject.findAll({
                    where: {
                        projectId: proj.id
                    }
                })

                if (localeNames.length > 0) {
                    proj.title = {}
                    proj.desc = {}
                    proj.cost = {}
                    proj.address = {}
                    proj.timePeriod = {}
                }

                for (let localeName of localeNames) {

                    const localeId = localeMap[localeName.localeId]
                    proj.title[localeId] = localeName.title;
                    proj.desc[localeId] = localeName.desc;
                    proj.cost[localeId] = localeName.cost;
                    proj.address[localeId] = localeName.address;
                    proj.timePeriod[localeId] = localeName.timePeriod;
                }
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
                cost,
                levels,
                area,
                timePeriod,
                address
            } = req.body

            let images = null

            if (req.files) {
                images = req.files.images
            }

            const locales = await Locale.findAll();

            const [localeTitles, localeDesc, localeCost, localeTimePeriod, localeAddress] =
                Utilities.extractLocaleObjects([title, desc, cost, timePeriod, address])

            console.log(req.files)

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
                levels,
                area,
            })

            const localeTexts = await LocaleTextProject.findAll({
                where: {
                    projectId: project.id
                }
            })

            for (const item of localeTexts) {

                const locale = locales.find(i => i.id === item.localeId).name;

                item.set({
                    title: localeTitles[locale],
                    desc: localeDesc[locale],
                    cost: localeCost[locale],
                    timePeriod: localeTimePeriod[locale],
                    address: localeAddress[locale],
                })
                await item.save();
            }

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
                    if (err) {
                        return next(ApiError.badRequest(err.message))
                    }
                    console.log('file was deleted')
                })
            })

            await LocaleTextProject.destroy({
                where: {
                    projectId: id
                }
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