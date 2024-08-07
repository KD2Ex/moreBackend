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

const Locale = sequelize.define("locale", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false}
})

const LocaleTextMaterial = sequelize.define('localeTextMaterial', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    text: {type: DataTypes.STRING, allowNull: false}
})

const LocaleTextTechnique = sequelize.define('localeTextTechnique', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    text: {type: DataTypes.STRING, allowNull: false}
})

const LocaleTextPainting = sequelize.define('localeTextPainting', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    desc: {type: DataTypes.STRING, allowNull: false},
    price: {type: DataTypes.STRING, allowNull: false},
})

const LocaleTextProject = sequelize.define('localeTextProject', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    desc: {type: DataTypes.STRING, allowNull: false},
    cost: {type: DataTypes.STRING, allowNull: false},
    address: {type: DataTypes.STRING, allowNull: false},
    timePeriod: {type: DataTypes.STRING, allowNull: false},
}, {timestamps: false})

const Post = sequelize.define('post', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    socialLink: {type: DataTypes.STRING, allowNull: true},
}, {timestamps: false})

const PostParagraph = sequelize.define('postParagraph', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    order: {type: DataTypes.INTEGER},
    // text style/formatting?
}, {timestamps: false})

const PostImage = sequelize.define('postImage', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    order: {type: DataTypes.INTEGER },
    relativeSize: {type: DataTypes.INTEGER },
}, {timestamps: false})

const LocalePost = sequelize.define('localePost', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
}, {timestamps: false})

const LocalePostParagraph = sequelize.define('localePostParagraph', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    text: {type: DataTypes.STRING, allowNull: false},
}, {timestamps: false})

Locale.hasMany(LocalePostParagraph)
LocalePostParagraph.belongsTo(Locale)

Locale.hasMany(LocalePost)
LocalePost.belongsTo(Locale)

PostParagraph.hasMany(LocalePostParagraph)
LocalePostParagraph.belongsTo(PostParagraph)

Post.hasMany(PostImage)
PostImage.belongsTo(Post)

Post.hasMany(PostParagraph)
PostParagraph.belongsTo(Post)

Post.hasMany(LocalePost)
LocalePost.belongsTo(Post)

Project.hasMany(LocaleTextProject)
LocaleTextProject.belongsTo(Project)

Locale.hasMany(LocaleTextProject)
LocaleTextProject.belongsTo(Locale)

Paint.hasMany(LocaleTextPainting)
LocaleTextPainting.belongsTo(Paint)

Locale.hasMany(LocaleTextPainting)
LocaleTextPainting.belongsTo(Locale)

Technique.hasMany(LocaleTextTechnique)
LocaleTextTechnique.belongsTo(Technique)

Locale.hasMany(LocaleTextTechnique)
LocaleTextTechnique.belongsTo(Locale)

Material.hasMany(LocaleTextMaterial)
LocaleTextMaterial.belongsTo(Material)

Locale.hasMany(LocaleTextMaterial)
LocaleTextMaterial.belongsTo(Locale)

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

module.exports = {
    Paint,
    Image,
    Material,
    Technique,
    Project,
    ProjectImage,
    Locale,
    LocaleTextMaterial,
    LocaleTextTechnique,
    LocaleTextPainting,
    LocaleTextProject,
    Post,
    LocalePost,
    PostParagraph,
    LocalePostParagraph,
    PostImage
}