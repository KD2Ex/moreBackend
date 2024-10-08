require('dotenv').config()
const express = require('express');
const sequelize = require('./db.js');
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const path = require('path')
const https = require('node:https')
const fs = require('node:fs')

const PORT = process.env.PORT || 5000;

/*
const certDir = `/etc/letsencrypt/live`;
const domain = `art-space-mo.com`;

const options = {
    key: fs.readFileSync(`${certDir}/${domain}/privkey.pem`),
    cert: fs.readFileSync(`${certDir}/${domain}/fullchain.pem`)
}
*/

const app = express();
app.use(cors({
    credentials: true,
    origin: [
        'http://art-space-mo.com',
        'https://art-space-mo.com',
        'http://localhost:5173']
}));

app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static/compressed')));
app.use(fileUpload({}));
app.use('/api', router);

app.use(express.static(path.resolve(__dirname, 'dist')))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})


app.use(errorHandler);

const start = async () => {
    try {
        // fake db connection

        await sequelize.authenticate()
        await sequelize.sync({alter: true})
        app.listen(PORT, () => console.log(`Server started on port ${PORT} ${path.join(__dirname, '..', '..', 'dist')}`))
    } catch (e) {
        console.log(e)
    }
}

start();

/*
https.createServer(options, app).listen(443, () => {
    console.log("           HTTPS is running")
})*/
