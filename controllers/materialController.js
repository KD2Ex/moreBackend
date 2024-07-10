const ApiError = require('../error/ApiError')
const {Material, Paint, LocaleText, Locale, MaterialLocaleText} = require("../models/models");
const {logger} = require("sequelize/lib/utils/logger");
const {sql} = require("sequelize")

class MaterialController {

    async create(req, res, next) {

        try {
            const {names} = req.body;

            const newMaterial = await Material.create(
                {
                    name: names[0].text,
                }
            )

            for (const item of names) {
                const locale = await LocaleText.create({
                    text: item.text,
                    localeId: item.localeId
                })

                await MaterialLocaleText.create({
                    materialId: newMaterial.id,
                    localeTextId: locale.id
                })
            }

            return res.status(200).json(newMaterial);
        } catch (e) {

            console.log(e.name)

            return next(ApiError.badRequest(e.message, e.name));
        }

    }

    async getAll(req, res, next) {

        try {
            const {localeId} = req.body;

            const materials = await Material.findAll();

            const result = JSON.parse(JSON.stringify(materials));

            let i = 0;

            for (const item of result) {

                const locales = await MaterialLocaleText.findAll({
                    where: {
                        materialId: item.id
                    }
                })

                for (const locale of locales) {
                    const localeText = await LocaleText.findByPk(locale.localeTextId)

                    console.log(localeText.localeId)
                    console.log(localeId)

                    if (localeText.localeId === localeId) {
                        item.name = localeText.text;

                        console.log(localeText.text)
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