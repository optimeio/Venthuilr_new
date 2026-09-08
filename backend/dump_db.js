const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/e com c/server/.env' });

const MONGO_URI = process.env.MONGO_URI;

async function dumpData() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;

        const products = await db.collection('products').find({}).toArray();
        console.log('--- PRODUCTS ---');
        console.log(JSON.stringify(products, null, 2));

        const users = await db.collection('users').find({}).toArray();
        console.log('--- USERS ---');
        console.log(JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

dumpData();
