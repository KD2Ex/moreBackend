const ApiError = require('../error/ApiError')
const {Paint, ObjectFit, Material, Technique} = require('../models/models')
const {Image} = require('../models/models')
const uuid = require('uuid')
const path = require('path');
const fs = require('node:fs');
const PaintingUtils = require('../utils/paintingUtils')

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
                techniqueId
            } = req.body;
            const {images} = req.files;

            console.log(materialId)
            console.log(techniqueId)
            //console.log(req.files.images)


            const painting = await Paint.create({
                title,
                desc,
                price,
                width,
                height,
                relativeSize,
                objectFit,
                materialId,
                techniqueId
            })

            const imageFileNames = await PaintingUtils.addImg(images, painting.id);

            const result = JSON.parse(JSON.stringify(painting));
            result.images = imageFileNames;
            //res.json(painting)
            return res.json(result);

        } catch (e) {

            return next(ApiError.badRequest(e.message))

        }

    }

    async getAll(req, res, next) {

        const paintings = await Paint.findAll(
            {
                include: [
                    {
                        model: Image, as: 'images',
                        attributes: ['name']
                    },
                ],
            }
        );



        /*let images = []

        paintings.forEach(i => {
            images = i.image.map(img => {
                img = img.name
                console.log(img)
                return img
            })
        })

        console.log(images)*/

        const result = JSON.parse(JSON.stringify(paintings));

        for (const painting of result) {

            for (let i = 0; i < painting.images.length; i++) {
                painting.images[i] = painting.images[i].name;
            }

            if (painting.materialId) {
                const material = await Material.findByPk(painting.materialId)
                painting.material = material
            }

            if (painting.techniqueId) {
                const technique = await Technique.findByPk(painting.techniqueId)
                painting.technique = technique
            }

            delete painting.materialId;
            delete painting.techniqueId;

        }

       /* result.forEach(painting => {
            //i.image.forEach(image => image = image.name)

        })*/

        return res.json(result);
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

            const painting = await Paint.findByPk(id);

            painting.set({
                title: title,
                desc: desc,
                price: price,
                width: width,
                height: height,
                materialId,
                techniqueId
            })

            if (images) {
                const imageFileNames = await PaintingUtils.addImg(images, id)

                result = imageFileNames;
            }

            await painting.save();

            return res.status(200).json(result)

        } catch (e) {

            return next(ApiError.badRequest(e.message));
        }

    }

}

module.exports = new PaintController();