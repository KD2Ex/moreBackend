const {Technique, Paint, LocaleTextTechnique} = require("../models/models");
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

            console.log(JSON.parse(JSON.stringify(result)))
            return res.status(200).json(result);

        } catch (e) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req, res, next) {

        try {

            const {localeId} = req.query;

            const techs = await Technique.findAll();
            const result = JSON.parse(JSON.stringify(techs));

            let i = 0;

            for (const item of result) {

                const locales = await LocaleTextTechnique.findAll({
                    where: {
                        techniqueId: item.id
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