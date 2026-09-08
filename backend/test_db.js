const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/e com c/server/.env' });

const MONGO_URI = process.env.MONGO_URI;

async function checkConnection() {
    try {
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('CONNECTED SUCCESSFULY');

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        // Count products
        const db = mongoose.connection.db;
        const productsCount = await db.collection('products').countDocuments();
        console.log('Products Count:', productsCount);

        const usersCount = await db.collection('users').countDocuments();
        console.log('Users Count:', usersCount);

        process.exit(0);
    } catch (err) {
        console.error('CONNECTION ERROR:', err);
        process.exit(1);
    }
}

checkConnection();
