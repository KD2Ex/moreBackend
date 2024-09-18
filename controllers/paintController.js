const ApiError = require('../error/ApiError')
const {Paint, Material, Technique, LocaleTextMaterial, LocaleTextTechnique, LocaleTextPainting, Locale,
    LocaleTextProject
} = require('../models/models')
const {Image} = require('../models/models')
const path = require('path');
const fs = require('node:fs');
const PaintingUtils = require('../utils/paintingUtils')
const Utilities = require('../utils/utilities')

class PaintController {

    async createLocaleData(req, res, next) {
        try {

            const {
                title,
                desc,
                price,
                paintId
            } = req.body;

            console.log(req.body)

            const locales = await Locale.findAll();

            for (let i = 0; i < locales.length; ++i) {

                const id = locales[i].id;
                const titleName = title.find(i => i.localeId === id)?.name;
                const descName = desc.find(i => i.localeId === id)?.name;
                const priceName = price.find(i => i.localeId === id)?.name;

                console.log({
                    t: titleName,
                    d: descName,
                    p: priceName,
                    lId: id,
                    pId: paintId
                })

                if (!titleName || !descName || !priceName) return next(ApiError.badRequest("Check the locale data"))


                const response = await LocaleTextPainting.create({
                    title: titleName,
                    desc: descName,
                    price: priceName,
                    localeId: id,
                    paintId: paintId
                })
            }

            return res.status(200).json(req.body)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async create(req, res, next) {
        try {
            const {
                width,
                height,
                relativeSize,
                objectFit,
                materialId,
                techniqueId,
            } = req.body;
            const {images} = req.files;

            console.log(materialId)
            console.log(techniqueId)

            let order = await Paint.max('order');
            ++order;

            const painting = await Paint.create({
                width,
                height,
                relativeSize,
                objectFit,
                materialId,
                techniqueId,
                order
            })

            const imageFileNames = await PaintingUtils
                .addImg(images, painting.id, 0, Image);


            const result = JSON.parse(JSON.stringify(painting));
            result.images = imageFileNames;


            return res.status(200).json(result);

        } catch (e) {

            return next(ApiError.badRequest(e.message))

        }
    }

    async getAll(req, res, next) {

        try {

            await PaintingUtils.processImages()

            let {page, limit, materialId, techniqueId, sort, localeId} = req.query;

            materialId = +materialId
            techniqueId = +techniqueId
            localeId = +localeId;

            const localeNames = await Locale.findAll();

            const order = []

            switch (+sort) {
                case 1:
                    order.push(['order', 'ASC'])
                    break;
                case 2:
                    order.push(['price', 'ASC'])
                    break;
                case 3:
                    order.push(['price', 'DESC'])
                    break;
            }

            const paintings = await Paint.findAll(
                {
                    include: [
                        {
                            model: Image, as: 'images',
                            attributes: ['name', 'order'],
                        },
                    ],
                    order: [...order],
                }
            );

            const count = await PaintingUtils.getFilteredCount(materialId, techniqueId)

            const totalCount = await Paint.count();

            const resultPaintings = JSON.parse(JSON.stringify(paintings.slice(page * limit - limit, limit * page)));
            let filteredPaintings = resultPaintings;


            const totalPages = Math.ceil(totalCount / limit);

            const result = {
                paintings: resultPaintings,
                totalPages: totalPages,
                filteredCount: count
            }

            for (const painting of result.paintings) {


                const locales = await LocaleTextPainting.findAll({
                    where: {
                        paintId: painting.id
                    }
                })

                if (locales.length > 0) {
                    painting.title = {};
                    painting.price = {};
                    painting.desc = {};
                }
                for (const locale of locales) {

                    const localeName = localeNames.find(i => i.id === locale.localeId).name

                    painting.title[localeName] = locale.title;
                    painting.price[localeName] = locale.price;
                    painting.desc[localeName] = locale.desc;

                }

                painting.images.sort((a, b) => a.order - b.order)

                const [material, technique] = await Promise.all([
                    Material.findByPk(painting.materialId),
                    Technique.findByPk(painting.techniqueId)
                ])

                const [materialLocaleNames, techniqueLocaleNames] = await Promise.all([
                    LocaleTextMaterial.findAll({
                        where: {
                            materialId: material.id,
                        },
                        order: ["localeId"]
                    }),
                    LocaleTextTechnique.findAll({
                        where: {
                            techniqueId: technique.id,
                        },
                        order: ["localeId"]
                    })
                ])


                const materialNames = {}
                const techniqueNames = {}


                for (let i = 0; i < localeNames.length; i++) {

                    materialNames[localeNames[i].name] = materialLocaleNames[i].text;
                    techniqueNames[localeNames[i].name] = techniqueLocaleNames[i].text;
                }

                material.name = materialLocaleNames ? materialNames : material.name;
                painting.material = material

                technique.name = techniqueLocaleNames ? techniqueNames : technique.name;
                painting.technique = technique

                delete painting.materialId;
                delete painting.techniqueId;
            }

            if (materialId !== 0) {
                filteredPaintings = filteredPaintings.filter(item => item.material?.id === materialId);
            }

            if (techniqueId !== 0) {
                filteredPaintings = filteredPaintings.filter(item => item.technique?.id === techniqueId);
            }

            filteredPaintings.forEach(item => {
                result.paintings.find(i => i.id === item.id).isFiltered = true;
            })

            return res.json(result);
        } catch (e) {

            return next(ApiError.badRequest(e.message))

        }
    }


    async delete(req, res, next) {

        const {id} = req.params;

        if (!id) {
            return next(ApiError.badRequest('id is required'))
        }

        const images = await Image.findAll({
            where: {
                entityId: id
            }
        })

        images.forEach(i => {
            fs.unlink(path.resolve(__dirname, '..', 'static', i.name), (err) => {
                if (err) throw err;
                console.log('file was deleted')
            })
            fs.unlink(path.resolve(__dirname, '..', 'static', 'compressed', i.name), (err) => {
                if (err) throw err;
                console.log('file was deleted')
            })
        })

        await LocaleTextPainting.destroy({
            where: {
                paintId: id
            }
        })

        await Image.destroy(
            {
                where: {
                    entityId: id
                }
            }
        )

        await Paint.destroy(
            {
                where: {id},
            }
        )

        return res.status(200).json('deleted')
    }

    async deleteAll(req, res, next) {

        try {

            await Paint.truncate({
                cascade: true
            });
            return res.status(200).json('All records deleted')
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async updateAllSizes(req, res, next) {

        try {

            const paintings = req.body;
            console.log(req.body)

            for (let i = 0; i < paintings.length; i++) {
                const painting = await Paint.findByPk(paintings[i].id);
                await painting.set({
                    relativeSize: paintings[i].relativeSize,
                    objectFit: paintings[i].objectFit,
                })

                await painting.save();
            }

            return res.status(200).json('updated')

        } catch (e) {

            return next(ApiError.badRequest(e.message))

        }
    }


    async updateLocaleData(req, res, next) {

        try {
            const {
                id,
                title,
                desc,
                price
            } = req.body;

            const localeTexts = await LocaleTextPainting.findAll({
                where: {
                    paintId: id
                }
            })

            for (let i = 0; i < localeTexts.length; ++i) {

                const localeId = localeTexts[i].localeId;
                const titleName = title.find(i => i.localeId === localeId)?.name;
                const descName = desc.find(i => i.localeId === localeId)?.name;
                const priceName = price.find(i => i.localeId === localeId)?.name;

                console.log({
                    t: titleName,
                    d: descName,
                    p: priceName,
                    lId: localeId,
                    pId: localeId
                })

                if (!titleName || !descName || !priceName) return next(ApiError.badRequest("Check the locale data"))


                localeTexts[i].set({
                    title: titleName,
                    desc: descName,
                    price: priceName,
                })

                await localeTexts[i].save();
            }

            return res.status(200).json(req.body);

        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }


    }

    async updatePainting(req, res, next) {

        try {

            const
                {
                    id,
                    width,
                    height,
                    materialId,
                    techniqueId
                } = req.body;
            let images = null;
            let result = [];

            if (req.files) {
                images = req.files.images;
            }


            console.log(req.files)

            const painting = await Paint.findByPk(id, {
                include: [
                    {
                        model: Image, as: 'images',
                        attributes: ['name', 'order']
                    },
                ],
            });



            painting.set({
                width: width,
                height: height,
                materialId,
                techniqueId
            })

            const json = JSON.parse(JSON.stringify(painting));
            const maxOrder = Math.max(...json.images.map(i => i.order));

            if (images) {
                const imageFileNames = await PaintingUtils
                    .addImg(images, id, maxOrder + 1, Image)

                result = imageFileNames;
            }


            await painting.save();

            return res.status(200).json(result)

        } catch (e) {

            return next(ApiError.badRequest(e.message));
        }

    }

    async updateOrder(req, res, next) {

        try {

            const items = req.body;

            console.log(items)

            for (let i of items) {

                await Paint.update({ order: i.order }, {
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

    async getFilteredCount(req, res, next) {

        try {

            let {materialId, techniqueId} = req.query

            materialId = +materialId
            techniqueId = +techniqueId

            const count = await PaintingUtils.getFilteredCount(materialId, techniqueId)

            return res.json(count)

        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }

    }

}

module.exports = new PaintController();