'use strict';

const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
const basename  = path.basename(module.filename);
const db        = {};

const sequelize = new Sequelize(
  process.env.DATABASE, 
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: process.env.DATABASE_DIALECT || 'sqlite',
    logging: !!parseInt(process.env.DATABASE_LOGGING || 0),
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    storage: (process.env.DATABASE_STORAGE === ':memory:' ? ':memory:' : `${__dirname}/../../${process.env.DATABASE_STORAGE || 'data/db.sqlite'}`),
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci'
    }
  }
);

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach((file) => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
