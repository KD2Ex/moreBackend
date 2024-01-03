const {ObjectFit} = require('../models/models')

class ObjectFitController {

    async add(req, res, next) {

        const {name} = req.body;

        const objectFit = await ObjectFit.create({name})

        return res.json(objectFit);

    }

}

module.exports = new ObjectFitController();