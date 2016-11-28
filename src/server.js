'import strict';

require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const multer      = require('multer');
const routes      = require('./routes.js');

const app         = express();
const server      = require('http').Server(app);

app.use(bodyParser.json());
app.use(multer({ dest: process.env.UPLOAD_PATH || '/var/tmp/transmission-uploads' }).single('torrent'));

routes(app);

module.exports = server;