require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://Nithya:123456Nith@ac-ypjxfsu-shard-00-00.dwrbhgg.mongodb.net:27017,ac-ypjxfsu-shard-00-01.dwrbhgg.mongodb.net:27017,ac-ypjxfsu-shard-00-02.dwrbhgg.mongodb.net:27017/ecomVen?ssl=true&replicaSet=atlas-10jm2p-shard-0&authSource=admin&retryWrites=true&w=majority';

async function clearDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for cleaning...');

        const collections = ['CustomerDetails', 'ProductDetails', 'MessageHistory', 'OrderRegistry'];

        for (const colName of collections) {
            const collection = mongoose.connection.collection(colName);
            const result = await collection.deleteMany({});
            console.log(`Cleared ${result.deletedCount} documents from ${colName}`);
        }

        console.log('Database cleared successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error clearing database:', err);
        process.exit(1);
    }
}

clearDatabase();
