const mongoose = require('mongoose');

async function checkLocalhost() {
    try {
        await mongoose.connect('mongodb://localhost:27017/venthulir');
        console.log('Connected to Localhost');

        const colls = await mongoose.connection.db.listCollections().toArray();
        console.log('Available Local Collections:', colls.map(c => c.name));

        const cCount = await mongoose.connection.db.collection('Coupons').countDocuments().catch(() => 0);
        console.log('Local Coupons:', cCount);

        const pCount = await mongoose.connection.db.collection('ProductDetails').countDocuments().catch(() => 0);
        console.log('Local Products:', pCount);

        await mongoose.disconnect();
    } catch (err) {
        console.log('Localhost not available or errored');
    }
}

checkLocalhost();
