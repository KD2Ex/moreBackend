const ApiError = require('../error/ApiError')
const {Paint, ObjectFit} = require('../models/models')
const {Image} = require('../models/models')
const uuid = require('uuid')
const path = require('path');
const fs = require('node:fs');

class PaintController {

    async create(req, res, next) {
        try {
            const {title, desc, price, width, height, relativeSize, objectFit} = req.body;
            const {images} = req.files;

            const imageFileNames = [];

                console.log(req.files.images)


            const painting = await Paint.create({title, desc, price, width, height, relativeSize, objectFit})



            if (Array.isArray(images)) {
                images.forEach(i => {
                    let fileName = uuid.v4() + '.jpg';
                    imageFileNames.push(fileName);
                    i.mv(path.resolve(__dirname, '..', 'static', fileName))

                    Image.create({
                        name: fileName,
                        paintId: painting.id
                    })
                })
            } else {
                let fileName = uuid.v4() + '.jpg';
                imageFileNames.push(fileName);
                images.mv(path.resolve(__dirname, '..', 'static', fileName))

                Image.create({
                    name: fileName,
                    paintId: painting.id
                })
            }



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
        result.forEach(painting => {
            //i.image.forEach(image => image = image.name)
            for (let i = 0; i < painting.images.length; i++) {
                painting.images[i] = painting.images[i].name;
            }
        })

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

}

module.exports = new PaintController();