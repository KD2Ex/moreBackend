const ApiError = require('../error/ApiError')
const {Material, Paint} = require("../models/models");
const {logger} = require("sequelize/lib/utils/logger");
const {sql} = require("sequelize")

class MaterialController {

    async create(req, res, next) {


        try {
            const {name} = req.body;

            const newMaterial = await Material.create({
                name
            })

            return res.status(200).json(newMaterial);
        } catch (e) {

            console.log(e.name)

            return next(ApiError.badRequest(e.message, e.name));
        }

    }

    async getAll(req, res, next) {

        try {

            const materials = await Material.findAll();

            return res.json(materials);

        } catch (e) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async delete(req, res, next) {

        try {
            const {id} = req.params;

            const usage = await Paint.findOne({
                where: {
                    materialId: id
                }
            })

            if (usage) {

                return next(ApiError.badRequest("Невозоможно удалить: Существуют картины с этим материалом"))
            }


            await Material.destroy({
                where: {id}
            })

            return res.status(200).json("ok");

        } catch (e) {
            return next(ApiError.badRequest(e.message));
        }

    }

}

module.exports = new MaterialController();