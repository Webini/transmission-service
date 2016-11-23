const server  = require('./src/server.js');
const worker  = require('./src/worker.js');
const winston = require('winston');

const port  = process.env.SERVER_PORT || 8080;
const host  = process.env.SERVER_HOST || 'localhost';
const delay = process.env.WORKER_DEALY || 500;

server.listen(port, host, () => {
    winston.info(`Server started on ${host}:${port}`);
    worker(delay);
});