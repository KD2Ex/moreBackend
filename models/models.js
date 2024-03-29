const sequelize = require('../db');
const {DataTypes} = require('sequelize')


const Paint = sequelize.define('paint', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, unique: true, },
    price: {type: DataTypes.INTEGER, },
    desc: {type: DataTypes.TEXT, allowNull: true},
    width: {type: DataTypes.INTEGER,},
    height: {type: DataTypes.INTEGER,},
    relativeSize: {type: DataTypes.INTEGER, },
    objectFit: {type: DataTypes.STRING, },
    order: {type: DataTypes.INTEGER, }
})

const Image = sequelize.define('image', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: true},
    order: {type: DataTypes.INTEGER }
})
/*
const ObjectFit = sequelize.define('objectFit', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true,}
})*/

const Material = sequelize.define('material', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, unique: true}
})

const Technique = sequelize.define('technique', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, unique: true}
})

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    login: {type: DataTypes.STRING, allowNull: false, unique: true},
    password: {type: DataTypes.STRING, allowNull: false}
})

const Token = sequelize.define('token', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    refreshToken: {type: DataTypes.STRING, allowNull: false}
})

User.hasOne(Token);
Token.belongsTo(User);

Paint.hasMany(Image, {as: 'images'});
Image.belongsTo(Paint);

Material.hasOne(Paint);
Paint.belongsTo(Material);

Technique.hasOne(Paint);
Paint.belongsTo(Technique);

/*
ObjectFit.hasMany(Paint);
Paint.belongsTo(ObjectFit);
*/

module.exports = {
    Paint,
    Image,
    Material,
    Technique
    //ObjectFit
}