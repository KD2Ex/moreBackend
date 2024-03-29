const ApiError = require('../error/ApiError')
const {Paint, ObjectFit, Material, Technique} = require('../models/models')
const {Image} = require('../models/models')
const uuid = require('uuid')
const path = require('path');
const fs = require('node:fs');
const PaintingUtils = require('../utils/paintingUtils')
const {Op, where} = require("sequelize");
const {mapFinderOptions} = require("sequelize/lib/utils");

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

            let order = await Paint.count();
            ++order;


            const painting = await Paint.create({
                title,
                desc,
                price,
                width,
                height,
                relativeSize,
                objectFit,
                materialId,
                techniqueId,
                order
            })

            const imageFileNames = await PaintingUtils.addImg(images, painting.id, 0);

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
            let {page, limit, materialId, techniqueId, sort} = req.query;

            materialId = +materialId
            techniqueId = +techniqueId

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

                for (let i = 0; i < painting.images.length; i++) {
                    //painting.images[i] = painting.images[i].name;
                }

                painting.images.sort((a, b) => a.order - b.order)

                if (painting.materialId) {
                    const material = await Material.findByPk(painting.materialId)
                    painting.material = material

                    /*if (materialId !== 0 && material.id === materialId) {
                        filteredPaintings.push(painting);
                    }*/
                }

                if (painting.techniqueId) {
                    const technique = await Technique.findByPk(painting.techniqueId)
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

    async getOne(req, res, next) {
        const {id} = req.params

        if (!id) {
            return next(ApiError.badRequest('not a valid id'))
        }

        const painting = await Paint.findOne(
            {
                where: {id},
                include: [{model: Image, as: 'image'}]
            },
        )

        return res.json(painting)
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

            //const {images} = req.files;

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
                title: title,
                desc: desc,
                price: price,
                width: width,
                height: height,
                materialId,
                techniqueId
            })

            const json = JSON.parse(JSON.stringify(painting));
            const maxOrder = Math.max(...json.images.map(i => i.order));

            if (images) {
                const imageFileNames = await PaintingUtils.addImg(images, id, maxOrder + 1)

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