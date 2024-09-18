const ApiError = require('../error/ApiError')
const {Project, ProjectImage, Locale, LocaleTextProject, LocaleTextPainting, Paint} = require("../models/models");
const PaintingUtils = require('../utils/paintingUtils')
const fs = require("node:fs");
const path = require("path");
const Utilities = require('../utils/utilities')


class ProjectController {


    async createLocaleData(req, res, next) {
        try {
            const {
                title,
                desc,
                cost,
                address,
                timePeriod,
                projectId
            } = req.body;

            const locales = await Locale.findAll();

            for (let i = 0; i < locales.length; ++i) {

                const id = locales[i].id;
                const titleName = title.find(i => i.localeId === id)?.name;
                const descName = desc.find(i => i.localeId === id)?.name;
                const costName = cost.find(i => i.localeId === id)?.name;
                const addressName = address.find(i => i.localeId === id)?.name;
                const timePeriodName = timePeriod.find(i => i.localeId === id)?.name;

                console.log({
                    t: titleName,
                    d: descName,
                    p: costName,
                    address: addressName,
                    time: timePeriodName,
                    lId: id,
                    pId: projectId
                })

                if (
                    !titleName
                    || !descName
                    || !costName
                    || !addressName
                    || !timePeriodName
                ) return next(ApiError.badRequest("Check the locale data"))

                const response = await LocaleTextProject.create({
                    title: titleName,
                    desc: descName,
                    cost: costName,
                    address: addressName,
                    timePeriod: timePeriodName,
                    localeId: id,
                    projectId: projectId
                })
            }

            return res.status(200).json(req.body);
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async create(req, res, next) {

        try {

            const {
                levels,
                area,
            } = req.body
            const {images} = req.files;

            let order = await Project.max('order');
            ++order;



            const project = await Project.create({
                levels,
                area,
                order,
                height: 400
            })

            const createdImages = await PaintingUtils
                .addImg(images, project.id, 0, ProjectImage)


            const result = JSON.parse(JSON.stringify(project))
            result.images = createdImages

            return res.json(result);

        } catch (e) {

            return next(ApiError.badRequest(e.message))

        }
    }

    async getAll(req, res, next) {
        try {

            await PaintingUtils.processImages()

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

    async updateLocaleData(req, res, next) {
        try {

            const {
                title,
                desc,
                cost,
                address,
                timePeriod,
                projectId
            } = req.body;

            console.log(req.body)

            const localeTexts = await LocaleTextProject.findAll({
                where: {
                    projectId: projectId
                }
            });

            for (let i = 0; i < localeTexts.length; ++i) {


                const id = localeTexts[i].localeId;
                const titleName = title.find(i => i.localeId === id)?.name;
                const descName = desc.find(i => i.localeId === id)?.name;
                const costName = cost.find(i => i.localeId === id)?.name;
                const addressName = address.find(i => i.localeId === id)?.name;
                const timePeriodName = timePeriod.find(i => i.localeId === id)?.name;

                console.log({
                    t: titleName,
                    d: descName,
                    p: costName,
                    address: addressName,
                    time: timePeriodName,
                    lId: id,
                    pId: projectId
                })

                if (
                    !titleName
                    || !descName
                    || !costName
                    || !addressName
                    || !timePeriodName
                ) return next(ApiError.badRequest("Check the locale data"))




                localeTexts[i].set({
                    title: titleName,
                    desc: descName,
                    cost: costName,
                    address: addressName,
                    timePeriod: timePeriodName,
                    localeId: id,
                    projectId: projectId
                })

                await localeTexts[i].save()
            }

            return res.status(200).json(req.body);

        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async update(req, res, next) {
        try {
            const {
                id,
                levels,
                area,
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
                levels,
                area,
            })

            const json = JSON.parse(JSON.stringify(project));

            let resultImages = []

            if (images) {
                const maxImagesOrder = Math.max(...json.images.map(i => i.order))

                resultImages = await PaintingUtils
                    .addImg(images, id, maxImagesOrder + 1, ProjectImage)

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
                where: {entityId: id}
            })

            images.forEach(i => {
                fs.unlink(path.resolve(__dirname, '..', 'static', i.name), (err) => {
                    if (err) {
                        return next(ApiError.badRequest(err.message))
                    }
                    console.log('file was deleted')
                })

                fs.unlink(path.resolve(__dirname, '..', 'static', 'compressed', i.name), (err) => {
                    if (err) next(ApiError.badRequest(err.message))
                    console.log('file was deleted')
                })
            })

            await LocaleTextProject.destroy({
                where: {
                    projectId: id
                }
            })

            await ProjectImage.destroy({
                where: {entityId: id}
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
            await Project.truncate({
                cascade: true
            });
            return res.status(200).json('All records deleted')
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