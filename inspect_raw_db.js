const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://123raza83:raza123@ac-dssmdy5-shard-00-00.wffnskl.mongodb.net:27017,ac-dssmdy5-shard-00-01.wffnskl.mongodb.net:27017,ac-dssmdy5-shard-00-02.wffnskl.mongodb.net:27017/kifayatly?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Kifayatly-Shop';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('kifayatly');
    const orders = database.collection('orders');

    const order1 = await orders.findOne({ orderId: 'ORD-MMTBB6DVRX3' });
    const order2 = await orders.findOne({ orderId: 'ORD-MMTBN2I9BSI' });

    const results = {
      order1: { keys: order1 ? Object.keys(order1) : null, data: order1 },
      order2: { keys: order2 ? Object.keys(order2) : null, data: order2 }
    };

    const fs = require('fs');
    fs.writeFileSync('db_inspection_results.json', JSON.stringify(results, null, 2));
    console.log('Results written to db_inspection_results.json');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
