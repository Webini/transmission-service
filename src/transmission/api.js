'use strict';
const Promise      = require('bluebird');
const Transmission = require('transmission');

function create(config) {
  return Promise.promisifyAll(new Transmission(config));
}

const instance = create({
  host: process.env.TRANSMISSION_HOST,
  port: process.env.TRANSMISSION_PORT,
  username: process.env.TRANSMISSION_USER,
  password: process.env.TRANSMISSION_PASSWORD,
  url: process.env.TRANSMISSION_URL
});

instance.create = create;

return instance;