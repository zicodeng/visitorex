// @ts-check
'use strict';

const express = require('express');
const app = express();
const morgan = require('morgan');

const serverAddr = process.env.SERVER_ADDR || 'localhost:4000';
const [host, port] = serverAddr.split(':');
const portNum = parseInt(port);

const mongodb = require('mongodb');
const mongoAddr = process.env.MONGO_ADDR || 'localhost:27017';
const dbName = process.env.DB_NAME;
if (!dbName) {
    console.log('Please set DB_NAME environment variable');
    process.exit(1);
}
const mongoURL = `mongodb://${mongoAddr}`;
const OfficeStore = require('./models/offices/office-store');
const VisitorStore = require('./models/visitors/visitor-store');

const redis = require('redis');
const redisAddr = process.env.REDIS_ADDR || 'localhost';

const amqp = require('amqplib');
// Queue name needs to be the same queue name that our gateway is listening to.
const visitorQueue = 'VisitorQueue';
const mqAddr = process.env.MQ_ADDR || 'localhost:5672';
const mqURL = `amqp://${mqAddr}`;

// Handlers
const OfficeHandler = require('./handlers/office');

(async () => {
    try {
        // Guarantee our MongoDB is started before clients can make any connections.
        const client = await mongodb.MongoClient.connect(mongoURL);
        const db = client.db(dbName);

        // Publish this microservice information to Redis Pub/Sub.
        const publisher = redis.createClient({
            host: redisAddr
        });
        const sec = 1000;
        const heartBeat = 10;
        const visitorMicroservice = {
            name: 'Visitor',
            pathPattern: '/v1/offices/?',
            address: serverAddr,
            heartbeat: heartBeat
        };
        const redisChannel = 'Microservices';
        setInterval(() => {
            publisher.publish(
                redisChannel,
                JSON.stringify(visitorMicroservice)
            );
        }, heartBeat * sec);

        // Add global middlewares.
        app.use(morgan(process.env.LOG_FORMAT || 'dev'));
        // Parses JSON in request body,
        // and makes it available from req.body.
        app.use(express.json());

        // All of the following APIs require the user to be authenticated.
        app.use((req, res, next) => {
            const userJSON = req.get('X-User');
            if (!userJSON) {
                res.set('Content-Type', 'text/plain');
                res.status(401).send('No X-User header found in the request');
                // Stop continuing.
                return;
            }
            // Invoke next chained handler if the user is authenticated.
            next();
        });

        // Connect to RabbitMQ.
        const connection = await amqp.connect(mqURL);
        const MQChannel = await connection.createChannel();
        // Durable queue writes messages to disk.
        // So even our MQ server dies,
        // the information is saved on disk and not lost.
        const qConf = await MQChannel.assertQueue(visitorQueue, {
            durable: false
        });
        app.set('MQChannel', MQChannel);
        app.set('visitorQueue', visitorQueue);

        // Initialize Mongo store.
        const collections = {
            offices: 'offices',
            visitors: 'visitors'
        };
        const officeStore = new OfficeStore(db, collections.offices);
        const visitorStore = new VisitorStore(db, collections.visitors);

        const visitorTrie = await visitorStore.index();

        // API resource handlers
        app.use(OfficeHandler(officeStore, visitorStore, visitorTrie));

        app.listen(portNum, host, () => {
            console.log(`Server is listening on http://${serverAddr}`);
        });
    } catch (err) {
        console.log(err);
    }
})();
