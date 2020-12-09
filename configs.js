const nodeEnv = process.env.NODE_ENV;
const service = require(`./configs/${nodeEnv}/service.json`);
const redis = require(`./configs/${nodeEnv}/redis.json`);

module.exports = {
    service, 
    redis
}