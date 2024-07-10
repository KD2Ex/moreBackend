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

const Project = sequelize.define('project', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    desc: {type: DataTypes.TEXT },
    cost: {type: DataTypes.INTEGER },
    levels: {type: DataTypes.INTEGER, allowNull: true},
    area: {type: DataTypes.INTEGER, allowNull: true},
    timePeriod: {type: DataTypes.STRING, allowNull: true},
    address: {type: DataTypes.STRING, allowNull: true},
    order: {type: DataTypes.INTEGER, allowNull: true},
    height: {type: DataTypes.INTEGER, allowNull: true}
})

const ProjectImage = sequelize.define('projectImage', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    order: {type: DataTypes.INTEGER }
})

const LocaleText = sequelize.define('localeText', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    text: {type: DataTypes.STRING, allowNull: false}
})

const Locale = sequelize.define("locale", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false}
})

const MaterialLocaleText = sequelize.define("materialLocaleText", {}, {timestamps: false})

Material.belongsToMany(LocaleText, { through: MaterialLocaleText})
LocaleText.belongsToMany(Material, { through: MaterialLocaleText})

Locale.hasMany(LocaleText)
LocaleText.belongsTo(Locale)

User.hasOne(Token);
Token.belongsTo(User);

Paint.hasMany(Image, {as: 'images'});
Image.belongsTo(Paint);

Material.hasOne(Paint);
Paint.belongsTo(Material);

Technique.hasOne(Paint);
Paint.belongsTo(Technique);

Project.hasMany(ProjectImage, {as: 'images'})
ProjectImage.belongsTo(Project)


/*
ObjectFit.hasMany(Paint);
Paint.belongsTo(ObjectFit);
*/

module.exports = {
    Paint,
    Image,
    Material,
    Technique,
    Project,
    ProjectImage,
    LocaleText,
    Locale,
    MaterialLocaleText
}