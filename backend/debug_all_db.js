const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/venthulir');
        console.log('Connected to DB');

        const colls = await mongoose.connection.db.listCollections().toArray();
        console.log('Available Collections:', colls.map(c => c.name));

        for (const coll of colls) {
            const count = await mongoose.connection.db.collection(coll.name).countDocuments();
            console.log(`- ${coll.name}: ${count} documents`);
            if (coll.name.toLowerCase().includes('product')) {
                const samples = await mongoose.connection.db.collection(coll.name).find().limit(5).toArray();
                console.log(`  Sample products in ${coll.name}:`, samples.map(s => s.name || s.title || s._id));
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkDatabase();
