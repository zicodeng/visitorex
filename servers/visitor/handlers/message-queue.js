module.exports = {
    sendToVisitorQueue: (req, message) => {
        const mqChannel = req.app.get('mqChannel');
        const qName = req.app.get('qName');
        mqChannel.sendToQueue(qName, Buffer.from(JSON.stringify(message)));
    }
};
