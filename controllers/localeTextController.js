const ApiError = require('../error/ApiError')
const {Material, Paint, LocaleText, MaterialLocaleText} = require("../models/models");

class LocaleTextController {

    async create(req, res, next) {
        try {
            const {text, localeId, subjectId} = req.body;

            const localeText = await LocaleText.create({
                text,
                localeId
            });

            return res.status(200).json(localeText)
        } catch (e) {
            console.log(e.name)

            return next(ApiError.badRequest(e.message, e.name));
        }
    }

    async createMaterial(req, res, next) {

        try {
            const {text, localeId, materialId} = req.body;

            const newLocaleText = await LocaleText.create({
                text,
                localeId
            })

            const materialLocaleText = await MaterialLocaleText.create({
                materialId,
                localeTextId: newLocaleText.id
            })

            return res.status(200).json(newLocaleText);
        } catch (e) {

        }
    }
}

module.exports = new LocaleTextController();