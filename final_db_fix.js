const mongoose = require('mongoose');

// Define Schema for the manual fix script
const OrderSchema = new mongoose.Schema({
  orderId: String,
  customerEmail: String
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

async function run() {
  const mongoUri = 'mongodb://123raza83:raza123@ac-dssmdy5-shard-00-00.wffnskl.mongodb.net:27017,ac-dssmdy5-shard-00-01.wffnskl.mongodb.net:27017,ac-dssmdy5-shard-00-02.wffnskl.mongodb.net:27017/kifayatly?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Kifayatly-Shop';

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // ORD-MMTBB6DVRX3 -> 123raza83@gmail.com (Based on user information from context)
    // Actually the user said "123ahmedraza56@gmail.com" for another order, but let's check ORD-MMTBN2I9BSI
    // ORD-MMTBN2I9BSI was my test order with "antigravity-test@example.com"
    
    const updates = [
        { id: 'ORD-MMTBB6DVRX3', email: '123raza83@gmail.com' },
        { id: 'ORD-MMTBN2I9BSI', email: 'antigravity-test@example.com' }
    ];

    for (const update of updates) {
        const result = await Order.updateOne(
            { orderId: update.id },
            { $set: { customerEmail: update.email } }
        );
        console.log(`Updated ${update.id} with ${update.email}:`, result.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGE');
    }

  } catch (err) {
    console.error('Error during manual fix:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
