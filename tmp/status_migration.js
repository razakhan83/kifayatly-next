const mongoose = require('mongoose');

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // 1. Pending -> Confirmed
    const pendingResult = await mongoose.connection.collection('orders').updateMany(
      { status: 'Pending' },
      { $set: { status: 'Confirmed' } }
    );
    console.log(`Updated ${pendingResult.modifiedCount} 'Pending' orders to 'Confirmed'`);

    // 2. Delivery Address Issue -> Address Issue
    const addressResult = await mongoose.connection.collection('orders').updateMany(
      { status: 'Delivery Address Issue' },
      { $set: { status: 'Address Issue' } }
    );
    console.log(`Updated ${addressResult.modifiedCount} 'Delivery Address Issue' orders to 'Address Issue'`);

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
