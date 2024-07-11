const ApiError = require('../error/ApiError')
const {Material, Paint, LocaleTextMaterial, } = require("../models/models");

class MaterialController {

    async create(req, res, next) {

        try {
            const {names} = req.body;

            console.log(names)

            const newMaterial = await Material.create(
                {
                    name: names[0].text,
                }
            )

            const result = [];

            for (const item of names) {
                const locale = await LocaleTextMaterial.create({
                    text: item.text,
                    localeId: item.localeId,
                    materialId: newMaterial.id
                })

                result.push(locale)
            }

            console.log(JSON.parse(JSON.stringify(result)))
            return res.status(200).json(result);
        } catch (e) {

            console.log(e.name)

            return next(ApiError.badRequest(e.message, e.name));
        }

    }

    async getAll(req, res, next) {

        try {
            const {localeId} = req.query;

            const materials = await Material.findAll();
            const result = JSON.parse(JSON.stringify(materials));

            let i = 0;

            for (const item of result) {

                const locales = await LocaleTextMaterial.findAll({
                    where: {
                        materialId: item.id
                    }
                })

                for (const locale of locales) {

                    if (locale.localeId == localeId) {
                        item.name = locale.text;
                        console.log(locale.text)
                        break;
                    }
                }
                i++;
            }

            console.log(result);
            return res.json(result);
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

            await LocaleTextMaterial.destroy({
                where: {
                    materialId: +id
                }
            })

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