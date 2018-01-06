module.exports = {
    sendToVisitorQueue: (req, message) => {
        const MQChannel = req.app.get('mq-channel');
        const visitorQueue = req.app.get('visitor-queue');
        MQChannel.sendToQueue(
            visitorQueue,
            Buffer.from(JSON.stringify(message))
        );
    }
};
