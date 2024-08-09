const {Post, PostParagraph, LocalePostParagraph, Locale, LocalePost, PostImage} = require("../models/models");
const ApiError = require('../error/ApiError')
const {logger} = require("sequelize/lib/utils/logger");
const uuid = require("uuid");
const path = require("path");

class PostController {

    async blobTest(req, res, next) {

        try {

            const {obj} = req.body;

            console.log(Object.getOwnPropertyNames(req.body))
            console.log(Object.getOwnPropertyNames(req.files))
            console.log(req.body)


            return res.status(200).json({'Ok': "ok"});

        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async create(req, res, next) {

        try {

            const {
                title,
                blocks,
                links
            } = req.body

            const resultJSON = {};
            const locales = await Locale.findAll();

            console.log("request body: ")
            console.log(req.body)

            const newPost = await Post.create({
                socialLink: links[0]
            })

            resultJSON.post = {...newPost.toJSON()}
            resultJSON.localePost = []
            resultJSON.paragraph = []
            resultJSON.pLocale = []

            for (const locale of locales) {
                const localePost = await LocalePost.create({
                    title: title[locale.name],
                    postId: newPost.id,
                    localeId: locale.id
                })

                resultJSON.localePost = [...resultJSON.localePost, {...localePost.toJSON()}]
            }

            for (let i = 0; i < blocks.length; i++) {

                const p = blocks[i];

                const paragraph = await PostParagraph.create({
                    order: p.order,
                    postId: newPost.id
                })

                resultJSON.paragraph = [...resultJSON.paragraph, {...paragraph.toJSON()}]
                for (const locale of locales) {

                    const pLocale = await LocalePostParagraph.create({
                        localeId: locale.id,
                        postParagraphId: paragraph.id,
                        text: blocks[i].value[locale.name]
                    })
                    resultJSON.pLocale = [...resultJSON.pLocale, {...pLocale.toJSON()}]
                }
            }

            const result = {
                id: newPost.id,
                title: title
            }

            console.log(resultJSON)

            return res.status(200).json(result)

        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }

    }

    async addImage(req, res, next) {
        try {

            const {id} = req.params;

            console.log(req.body)
            console.log(req.files)

            const resultJSON = {
                images: []
            }

            for (const prop of Object.getOwnPropertyNames(req.body)) {
                const info = JSON.parse(req.body[prop])
                const image = req.files[prop]

                let fileName = uuid.v4() + '.jpg';
                resultJSON.images.push({name: fileName, order: info['order'], size: info['size']});
                image.mv(path.resolve(__dirname, '..', 'static', fileName))

                await PostImage.create({
                    name: fileName,
                    order: info['order'],
                    relativeSize: info['size'],
                    postId: 16
                })
            }

            return res.status(200).json(resultJSON);

        } catch (e) {

        }
    }

    async getOne(req, res, next) {
        const {id} = req.params;

        const resultJSON = {}
        resultJSON.blocks = []


        const post = await Post.findOne({
            where: {
                id: id
            }
        })

        const titles = await LocalePost.findAll({
            where: {
                postId: post.id
            }
        })

        resultJSON.title = titles

        const paragraphs = await PostParagraph.findAll({
            where: {
                postId: post.id
            },
        })

        for (const p of paragraphs) {
            const localeParagraphs = await LocalePostParagraph.findAll({
                where: {
                    postParagraphId: p.id
                },
            })

            const block = {
                order: p.order,
                type: 'text',
                size: 12,
                value: []
            }

            for (const lP of localeParagraphs) {
                block.value.push({
                    localeId: lP.localeId,
                    text: lP.text
                })
            }
            resultJSON.blocks.push(block)
        }

        //find images

        console.log(resultJSON)
        return res.status(200).json(resultJSON);
    }

    async getAll(req, res, next) {

        const resultJSON = {}
        resultJSON.posts = []

        const posts = await Post.findAll();

        for (const post of posts) {
            const titles = await LocalePost.findAll({
                where: {
                    postId: post.id
                }
            })
            const title = titles.map(i => {
                return { title: i.title, localeId: i.localeId };
            })
            resultJSON.posts.push({...post.toJSON(), title: title})
        }

        console.log(resultJSON)

        //preview image

        return res.status(200).json(resultJSON);
    }

    async update(req, res, next) {

    }

    async delete(req, res, next) {

    }

}

module.exports = new PostController();