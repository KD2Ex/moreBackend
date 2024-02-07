const {Image} = require('../models/models')
const uuid = require('uuid')
const path = require('path');


class PaintingUtils {

    async addImg(images, paintingId) {

        const imageFileNames = [];

        if (Array.isArray(images)) {
            images.forEach(i => {
                let fileName = uuid.v4() + '.jpg';
                imageFileNames.push(fileName);
                i.mv(path.resolve(__dirname, '..', 'static', fileName))

                Image.create({
                    name: fileName,
                    paintId: paintingId
                })
            })
        } else {
            let fileName = uuid.v4() + '.jpg';
            imageFileNames.push(fileName);
            images.mv(path.resolve(__dirname, '..', 'static', fileName))

            Image.create({
                name: fileName,
                paintId: paintingId
            })
        }

        return imageFileNames;

    }
}

module.exports = new PaintingUtils();