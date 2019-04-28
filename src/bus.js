const RABBITMQ_EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'amq.topic';
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const LOG_PREFIX = 'RabbitMQBus';
const winston = require('winston');
const bus = require('servicebus');

const defaultOptions = {
  exchangeName: RABBITMQ_EXCHANGE,
  exchangeOptions: {
    durable: true,
    type: 'topic',
    autoDelete: false,
  },
};

if (!RABBITMQ_URL) {
  module.exports = null;
} else {
  const inst = bus.bus({
    url: RABBITMQ_URL,
    log: function(...args) {
      winston.info(LOG_PREFIX, args);
    },
    assertQueuesOnFirstSend: true,
  });

  inst.use(inst.correlate());

  inst._publish = inst.publish;
  inst.publish = function(queueName, message, options, cb) {
    const newOptions = options || defaultOptions;
    this._publish.apply(this, [queueName, message, newOptions, cb]);
  };

  module.exports = inst;
}
