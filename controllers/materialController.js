const ApiError = require('../error/ApiError')
const {Material, Paint, LocaleTextMaterial, Locale, } = require("../models/models");

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
            const jsonResult = JSON.parse(JSON.stringify(result))
            for (let item of jsonResult) {
                item.entityId = item.materialId;
                delete item.materialId;
            }
            console.log(jsonResult)
            return res.status(200).json(jsonResult);
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

            const localeNames = await Locale.findAll();

            for (const item of result) {

                const locales = await LocaleTextMaterial.findAll({
                    where: {
                        materialId: item.id
                    }
                })

                if (locales.length > 0) item.name = {}

                for (const locale of locales) {
                    const localeName = localeNames.find(i => i.id === locale.localeId).name
                    item.name[localeName] = locale.text;
                }
            }

           //console.log(result);
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