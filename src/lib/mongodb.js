import { MongoClient } from 'mongodb';

// Use the standard connection string from environment (without +srv)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://123raza83:raza4321@storecluster-shard-00-00.ny47dd4.mongodb.net:27017,storecluster-shard-00-01.ny47dd4.mongodb.net:27017,storecluster-shard-00-02.ny47dd4.mongodb.net:27017/kifayatly?ssl=true&replicaSet=atlas-ny47dd-shard-0&authSource=admin&retryWrites=true&w=majority';

let client;
let clientPromise;

async function connectToDatabase() {
  try {
    if (!client) {
      console.log('🔄 Creating MongoDB client...');
      console.log('Connection URI:', MONGODB_URI.substring(0, 50) + '...');

      client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 30000, // 30 seconds to bypass DNS issues
        connectTimeoutMS: 10000,
        family: 4, // Force IPv4
      });

      clientPromise = client.connect();
    }

    console.log('🔄 Connecting to MongoDB...');
    await clientPromise;

    console.log('✅ MongoDB connected successfully!');
    console.log('Database:', client.db().databaseName);

    return client.db();
  } catch (error) {
    console.error('❌ DATABASE CONNECTION ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export default connectToDatabase;