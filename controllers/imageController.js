const {Image} = require('../models/models')
const ApiError = require('../error/ApiError')
const fs = require("node:fs");
const path = require("path");

class ImageController {

    async add(req, res, next) {

        const {paintId} = req.body;
        const {id} = req.files;

        const image = await Image.create({paintId, name});
        return res.json(image);

    }

    async deleteOne(req, res, next) {

        try {
            const {name} = req.body;

            await Image.destroy({where: {name: name}})

            fs.unlink(path.resolve(__dirname, '..', 'static', name), (err) => {
                if (err) throw err;
                console.log('file was deleted')
            })

            return res.status(200).json("deleted");
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }


}

module.exports = new ImageController();