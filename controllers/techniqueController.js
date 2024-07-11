const {Technique, Paint, LocaleTextTechnique, Locale} = require("../models/models");
const ApiError = require("../error/ApiError");

class TechniqueController {

    async create(req, res, next) {

        try {

            const {names} = req.body;

            console.log(names)

            const newTechnique = await Technique.create(
                {
                    name: names[0].text,
                }
            )

            const result = [];

            for (const item of names) {
                const locale = await LocaleTextTechnique.create({
                    text: item.text,
                    localeId: item.localeId,
                    techniqueId: newTechnique.id
                })

                result.push(locale)
            }

            const jsonResult = JSON.parse(JSON.stringify(result))
            for (let item of jsonResult) {
                item.entityId = item.techniqueId;
                delete item.techniqueId;
            }
            console.log(jsonResult)
            return res.status(200).json(jsonResult);

        } catch (e) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req, res, next) {

        try {
            const {localeId} = req.query;

            const techs = await Technique.findAll();
            const result = JSON.parse(JSON.stringify(techs));

            const localeNames = await Locale.findAll();

            for (const item of result) {

                const locales = await LocaleTextTechnique.findAll({
                    where: {
                        techniqueId: item.id
                    }
                })

                if (locales.length > 0) item.name = {}

                for (const locale of locales) {
                    const localeName = localeNames.find(i => i.id === locale.localeId).name
                    item.name[localeName] = locale.text;
                }
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
                    techniqueId: id
                }
            })

            if (usage) {

                return next(ApiError.badRequest("Невозоможно удалить: Существуют картины с этой техникой"))
            }

            await LocaleTextTechnique.destroy({
                where: {
                    techniqueId: +id
                }
            })

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