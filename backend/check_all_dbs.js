const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/e com c/server/.env' });

async function listAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('--- ALL DATABASES ---');
        console.log(dbs.databases.map(db => db.name));

        console.log('--- CURRENT DB COLLECTIONS ---');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(collections.map(c => c.name));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
listAll();
