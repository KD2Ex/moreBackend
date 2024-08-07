const {Image, Paint} = require('../models/models')
const uuid = require('uuid')
const path = require('path');


class PaintingUtils {

    async addImg(images, paintingId, startingPoint, table) {

        const imageFileNames = [];

        if (Array.isArray(images)) {
            images.forEach((i, index) => {
                let fileName = uuid.v4() + '.jpg';
                imageFileNames.push({name: fileName, order: startingPoint + index});
                i.mv(path.resolve(__dirname, '..', 'static', fileName))

                 table.create({
                    name: fileName,
                    paintId: paintingId,
                    order: startingPoint + index
                })

            })
        } else {
            let fileName = uuid.v4() + '.jpg';
            imageFileNames.push({name: fileName, order: startingPoint});
            images.mv(path.resolve(__dirname, '..', 'static', fileName))

            await table.create({
                name: fileName,
                paintId: paintingId,
                order: startingPoint
            })
        }

        return imageFileNames;

    }

    async getFilteredCount(materialId, techniqueId) {

        materialId = +materialId
        techniqueId = +techniqueId

        const filters = []
        const whereObject = {}

        if (materialId !== 0) filters.push({materialId: +materialId})
        if (techniqueId !== 0) filters.push({techniqueId: +techniqueId})

        for (let filter of filters) {
            const name = Object.getOwnPropertyNames(filter)[0]

            console.log(name)
            console.log(filter[name])

            Object.defineProperty(whereObject, name, {
                value: filter[name],
                writable: true,
                enumerable: true,
            })
            console.log(whereObject)
        }

        console.log(filters, whereObject)

        const count = await Paint.count({
            where: {...whereObject}
        })
        console.log(count);

        return count;

    }
}

module.exports = new PaintingUtils();