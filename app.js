const admin = require('firebase-admin');
const configs = require('./configs.js');
const ioredis = require('ioredis');
const events = require('events');
const { cwd } = require('process');
const eventEmitter = new events.EventEmitter();
const { host, port } = configs.redis;

const redis = new ioredis({ host, port });

const serviceAccount = configs.service;

admin.initializeApp({ credential: admin.credential.cert(serviceAccount)});

const MESSAGE_TYPE = {
    DEVICE: 1,
    APP: 2,
    GROUP: 3
}

eventEmitter.on('startFcm', () => {
    redis.blpop("push:message", 0).then((result) => {
        try {
            const message = JSON.parse(result[1]);
            const pushType = message.pushType;
            
            if( pushType == MESSAGE_TYPE.DEVICE ) {
                notificationForDevice(message);
            }
            else if( pushType == MESSAGE_TYPE.APP ) {
                notificationForApp(message);
            }
        }
        catch(err) {
            console.log(err);
        }

        eventEmitter.emit('startFcm');
    });
})

function notificationForDevice(result) {
    const { title, body, fcmToken } = result;
    const message = { title, body }

    admin.messaging().send({ notification: message, token: fcmToken })
    .then((response) => {
        console.log(response);
    })
    .catch((error) => {
        console.log(error);
        console.log(fcmToken, message);
    })
}

function notificationForApp(result) {
    const { title, body } = result;
    const message = { title, body };

    admin.messaging().send({ notification: message, topic: "/topics/all" })
    .then((response) => {
        console.log(response);
    })
    .catch((error) => {
        console.log(error);
        console.log(fcmToken, message);
    })
}

eventEmitter.emit('startFcm');

console.log("fcm server start");