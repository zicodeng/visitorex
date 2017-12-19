module.exports = {
    sendToVisitorQueue: (req, message) => {
        const MQChannel = req.app.get('MQChannel');
        const visitorQueue = req.app.get('visitorQueue');
        MQChannel.sendToQueue(visitorQueue, Buffer.from(JSON.stringify(message)));
    }
};
