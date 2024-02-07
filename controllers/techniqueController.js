const {Technique, Paint} = require("../models/models");
const ApiError = require("../error/ApiError");

class TechniqueController {

    async create(req, res, next) {

        try {
            const {name} = req.body;

            const newTechnique = await Technique.create({
                name
            })

            return res.status(200).json(newTechnique);
        } catch (e) {
            return next(ApiError.badRequest(e.message));
        }

    }

    async getAll(req, res, next) {

        try {

            const techniques = await Technique.findAll();

            return res.json(techniques);

        } catch (e) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async delete(req, res, next) {

        try {
            const {id} = req.params;

            const usage = await Paint.findOne({
                where: {
                    techniqueId: id
                }
            })

            if (usage) {

                return next(ApiError.badRequest("Невозоможно удалить: Существуют картины с этой техникой"))
            }

            await Technique.destroy({
                where: {
                    id: id
                }
            })



            return res.status(200).json("ok");

        } catch (e) {
            return next(ApiError.badRequest(e.message));
        }

    }


}

module.exports = new TechniqueController();