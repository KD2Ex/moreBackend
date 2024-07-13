const ApiError = require('../error/ApiError')
const {ProjectImage} = require("../models/models");
const fs = require("node:fs");
const path = require("path");

class ProjectImageController {

    async delete(req, res, next) {

        try {

            const {name} = req.body

            await ProjectImage.destroy({
                where: {
                    name
                }
            })

            fs.unlink(path.resolve(__dirname, '..', 'static', name), (err) => {
                if (err) {
                    return next(ApiError.badRequest(err.message, err.name))
                }
                console.log('file was deleted')
            })


            return res.status(200).json("deleted");
        } catch (e) {
            return next(ApiError.badRequest(e.message, e.name))
        }

    }

}

module.exports = new ProjectImageController();