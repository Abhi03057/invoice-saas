const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null
});

const documentQueue = new Queue("document-processing", {
  connection
});

module.exports = documentQueue;