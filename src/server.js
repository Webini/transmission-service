'use strict';

const express     = require('express');
const multer      = require('multer');
const routes      = require('./routes.js');

const app         = express();
const server      = require('http').Server(app);
const apiRender   = require('./middlewares/apiRender.js');

app.use(apiRender);

routes(
  app, 
  multer({ dest: process.env.UPLOAD_PATH || '/var/tmp/transmission-uploads' })
);

module.exports = server;