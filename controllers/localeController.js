const ApiError = require('../error/ApiError')
const {Locale} = require("../models/models");

class LocaleController {

    async getAll(req, res, next) {

        try {

            const locales = await Locale.findAll();

            return res.status(200).json(locales);

        } catch (e) {

            return next(ApiError.badRequest(e.message, e.name))

        }

    }
}

module.exports = new LocaleController();