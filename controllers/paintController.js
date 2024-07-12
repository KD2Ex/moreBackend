const ApiError = require('../error/ApiError')
const {Paint, Material, Technique, LocaleTextMaterial, LocaleTextTechnique, LocaleTextPainting, Locale} = require('../models/models')
const {Image} = require('../models/models')
const path = require('path');
const fs = require('node:fs');
const PaintingUtils = require('../utils/paintingUtils')
const Utilities = require('../utils/utilities')

class PaintController {

    async create(req, res, next) {
        try {
            const {
                title,
                desc,
                price,
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
            console.log(images)

            let order = await Paint.max('order');
            ++order;

            const locales = await Locale.findAll();

            const [localeTitles, localeDesc, localePrice] =
                Utilities.extractLocaleObjects([title, desc, price])

            const painting = await Paint.create({
                title,
                desc,
                price: 0,
                width,
                height,
                relativeSize,
                objectFit,
                materialId,
                techniqueId,
                order
            })

            const imageFileNames = await PaintingUtils
                .addImg(images, painting.id, 0, Image, "paint");

            for (const locale of locales) {

                const localeTextPainting = await LocaleTextPainting.create({
                    title: localeTitles[locale.name],
                    desc: localeDesc[locale.name],
                    price: localePrice[locale.name],
                    localeId: locale.id,
                    paintId: painting.id
                })
            }

            const result = JSON.parse(JSON.stringify(painting));
            result.images = imageFileNames;


            /*result.material = {
                id: result.materialId,
                name: result
            }*/
            //res.json(painting)
            return res.json(result);

        } catch (e) {

            return next(ApiError.badRequest(e.message))

        }
    }

    async getAll(req, res, next) {

        try {
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

            console.log([...order])

            const offset = (page - 1) * limit ;
            const paintings = await Paint.findAll(
                {
                    include: [
                        {
                            model: Image, as: 'images',
                            attributes: ['name', 'order']
                        },
                    ],
                    order: [...order],
                    /*limit: limit,
                    offset: offset,
                    distinct: true*/
                }
            );

            const count = await PaintingUtils.getFilteredCount(materialId, techniqueId)

            const totalCount = await Paint.count();

            const totalElements = paintings.length;
            const resultPaintings = JSON.parse(JSON.stringify(paintings.slice(page * limit - limit, limit * page)));
            let filteredPaintings = resultPaintings;

            console.log(page, limit)

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

                /*const locale = locales.find(i => i.localeId === localeId)
                if (locale) {
                    painting.title = locale.title;
                    painting.price = locale.price;
                    painting.desc = locale.desc;
                }
                 */


                painting.images.sort((a, b) => a.order - b.order)

                if (painting.materialId) {
                    const material = await Material.findByPk(painting.materialId)
                    const materialLocaleNames = await LocaleTextMaterial.findAll({
                        where: {
                            materialId: material.id,
                        }
                    })

                    const materialNames = {}
                    materialLocaleNames.forEach(i => {
                        const localeName = localeNames.find(lName => lName.id === i.localeId).name
                        materialNames[localeName] = i.text;
                    })

                    material.name = materialLocaleNames ? materialNames : material.name;
                    painting.material = material

                    /*if (materialId !== 0 && material.id === materialId) {
                        filteredPaintings.push(painting);
                    }*/
                }

                if (painting.techniqueId) {
                    const technique = await Technique.findByPk(painting.techniqueId)
                    const techniqueLocaleNames = await LocaleTextTechnique.findAll({
                        where: {
                            techniqueId: technique.id,
                        }
                    })

                    const techniqueNames = {}
                    techniqueLocaleNames.forEach(i => {
                        const localeName = localeNames.find(lName => lName.id === i.localeId).name
                        techniqueNames[localeName] = i.text;
                    })

                    technique.name = techniqueLocaleNames ? techniqueNames : technique.name;
                    painting.technique = technique

                    /*if (techniqueId !== 0 && technique.id === techniqueId) {
                        filteredPaintings.push(painting);
                    }*/
                }

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
            where: {paintId: id}
        })

        images.forEach(i => {
            fs.unlink(path.resolve(__dirname, '..', 'static', i.name), (err) => {
                if (err) throw err;
                console.log('file was deleted')
            })
        })

        await Image.destroy(
            {
                where: {
                    paintId: id
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

            next(ApiError.badRequest(e.message))

        }
    }

    async updatePainting(req, res, next) {

        try {

            const {id, title, desc, price, width, height, materialId, techniqueId} = req.body;
            let images = null;
            let result = [];

            if (req.files) {
                images = req.files.images;
            }

            const locales = await Locale.findAll();

            const [localeTitles, localeDesc, localePrice] =
                Utilities.extractLocaleObjects([title, desc, price])
            console.log(req.files)

            const painting = await Paint.findByPk(id, {
                include: [
                    {
                        model: Image, as: 'images',
                        attributes: ['name', 'order']
                    },
                ],
            });

            const localeTexts = await LocaleTextPainting.findAll({
                where: {
                    paintId: painting.id
                }
            })

            for (let item of localeTexts) {

                const locale = locales.find(i => i.id === item.localeId).name;

                item.set({
                    title: localeTitles[locale],
                    desc: localeDesc[locale],
                    price: localePrice[locale],
                })
            }

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
                    .addImg(images, id, maxOrder + 1, Image, "paint")

                result = imageFileNames;
            }

            for (let item of localeTexts) {
                await item.save();
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