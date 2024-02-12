const {User} = require('../models/models')
const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const {hash} = require("bcrypt");

class UserService {

    async signup(email, password) {

        const userExists = await User.findOne({
            where: {email}
        })

        if (userExists) {
            throw new Error(`Пользователь с электронной почтой ${email} уже существует`)
        }

        const hashPassword = await bcrypt.hash(password, 3);

        const user = await User.create({
            login: email,
            password: hashPassword
        })

    }

}

module.exports = new UserService();