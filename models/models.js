const sequelize = require('../db');
const {DataTypes} = require('sequelize')


const Paint = sequelize.define('paint', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, unique: true, },
    price: {type: DataTypes.INTEGER, },
    desc: {type: DataTypes.STRING, allowNull: true},
    width: {type: DataTypes.INTEGER,},
    height: {type: DataTypes.INTEGER,},
    relativeSize: {type: DataTypes.INTEGER, },
    objectFit: {type: DataTypes.STRING, },
})

const Image = sequelize.define('image', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: true},
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