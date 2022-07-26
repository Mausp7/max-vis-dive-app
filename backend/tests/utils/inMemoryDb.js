const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');

const startVirtualDb = async () => {
    const virtualMongoDb = await MongoMemoryServer.create();
    const uri = virtualMongoDb.getUri();
    const connectionVirtualMongoDb = await mongoose.connect(uri);
    return {connectionVirtualMongoDb, virtualMongoDb};
};

const stopVirtualDb = async (connectionVirtualMongoDb, virtualMongoDb) => {
    await connectionVirtualMongoDb.disconnect();
    await virtualMongoDb.stop();
};

const clearDb = async (...collections) => {
    await Promise.all(collections.map(collection => collection.deleteMany()));
};

module.exports = {startVirtualDb, stopVirtualDb, clearDb}