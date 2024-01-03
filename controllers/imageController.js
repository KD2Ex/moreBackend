const {Image} = require('../models/models')

class ImageController {

    async add(req, res, next) {

        const {paintId} = req.body;
        const {id} = req.files;

        const image = await Image.create({paintId, name});
        return res.json(image);

    }

}

module.exports = new ImageController();