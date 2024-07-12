const {Locale} = require("../models/models");

class Utilities {

    extractLocaleObjects(list) {

        const result = [];

        for (const stringItem of list) {
            const splitArr = stringItem.split(':')
            const newItem = {};
            for (let i = 0; i < splitArr.length; i += 2) {
                newItem[splitArr[i]] = splitArr[i + 1];
            }
            result.push(newItem);
        }

        return result

    }
}

module.exports = new Utilities();