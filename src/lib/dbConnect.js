import mongoose from 'mongoose';

// ============================================
// ENVIRONMENT VARIABLE VALIDATION
// ============================================
console.log('\n📋 [ENV CHECK] Loading environment variables...');

const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';
const VERCEL_ENV = process.env.VERCEL_ENV; // Vercel sets this automatically

console.log('[ENV CHECK] NODE_ENV:', NODE_ENV);
console.log('[ENV CHECK] VERCEL_ENV:', VERCEL_ENV || 'Not on Vercel');
console.log('[ENV CHECK] MONGODB_URI defined:', !!MONGODB_URI);

if (MONGODB_URI) {
    // Log masked URI for security (hide password)
    const maskedURI = MONGODB_URI.replace(/:[^@]+@/, ':****@');
    console.log('[ENV CHECK] MONGODB_URI:', maskedURI);
} else {
    console.error('❌ [ENV CHECK] MONGODB_URI is NOT defined');
    console.error('❌ Please add MONGODB_URI to your environment variables');
}

if (!MONGODB_URI) {
    throw new Error('❌ MONGODB_URI is not defined');
}

// ============================================
// CONNECTION OPTIONS - DIFFERENT FOR LOCALHOST VS VERCEL
// ============================================
/**
 * MongoDB connection options
 * Vercel: Standard options work fine
 * Localhost: Need special options to avoid DNS/SRV issues
 */
const isVercel = !!VERCEL_ENV;
const isLocalhost = NODE_ENV === 'development' && !isVercel;

console.log('[DB CONFIG] Environment:', isVercel ? 'Vercel' : 'Localhost');

const mongooseOptions = isVercel ? {
    // Vercel: Standard options work fine
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
} : {
    // Localhost: Special options to avoid DNS/SRV issues
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4 to avoid DNS issues
    retryWrites: true,
    w: 'majority',
    maxPoolSize: 10,
    minPoolSize: 1,
};

console.log('[DB CONFIG] Connection options:', mongooseOptions);
    serverSelectionTimeoutMS: mongooseOptions.serverSelectionTimeoutMS,
    connectTimeoutMS: mongooseOptions.connectTimeoutMS,
    socketTimeoutMS: mongooseOptions.socketTimeoutMS,
    family: mongooseOptions.family,
    retryWrites: mongooseOptions.retryWrites,
});

// ============================================
// CONNECTION CACHING
// ============================================
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// ============================================
// TEST CONNECTION FUNCTION
// ============================================
async function testMongoDBConnection() {
    try {
        console.log('[TEST] 🧪 Running MongoDB connection test...');
        const adminDb = mongoose.connection.getClient().db('admin');
        const status = await adminDb.admin().ping();
        console.log('✅ [TEST] MongoDB ping successful:', status);
        return true;
    } catch (error) {
        console.error('❌ [TEST] MongoDB ping failed:', error.message);
        return false;
    }
}

// ============================================
// DETAILED ERROR LOGGER
// ============================================
function logConnectionError(error) {
    console.error('\n');
    console.error('═'.repeat(60));
    console.error('❌ [MONGODB ERROR] DETAILED ERROR INFORMATION');
    console.error('═'.repeat(60));
    
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error CodeName:', error.codeName);
    
    if (error.reason) {
        console.error('Error Reason:', error.reason);
    }
    
    if (error.serverSelectionTimeoutMS) {
        console.error('Server Selection Timeout (ms):', error.serverSelectionTimeoutMS);
    }

    console.error('\nFull Error Object:', JSON.stringify(error, null, 2));
    
    // ============================================
    // DIAGNOSIS SUGGESTIONS
    // ============================================
    console.error('\n📋 [DIAGNOSIS] Possible causes:');
    
    if (error.codeName === 'QuerySrvFailed' || error.message.includes('querySrv')) {
        console.error('  • ❌ DNS SRV Resolution Failed (querySrv)');
        console.error('  • 💡 Solution: Use standard mongodb:// URL instead of mongodb+srv://');
        console.error('  • 💡 Check: MongoDB Atlas → Connect → Standard Connection String');
    }
    
    if (error.code === 'ECONNREFUSED') {
        console.error('  • ❌ Connection Refused');
        console.error('  • 💡 Check: MongoDB host/port reachability');
        console.error('  • 💡 Check: Firewall/Network settings');
        console.error('  • 💡 Try: Adding family: 4 option (already enabled)');
    }
    
    if (error.message.includes('authentication failed') || error.message.includes('Unauthorized')) {
        console.error('  • ❌ Authentication Failed');
        console.error('  • 💡 Check: Username and password in MONGODB_URI');
        console.error('  • 💡 Check: Special characters in password (may need URL encoding)');
        console.error('  • 💡 Check: User permissions on database');
    }
    
    if (error.message.includes('Timeout')) {
        console.error('  • ❌ Connection Timeout');
        console.error('  • 💡 Check: Network connectivity to MongoDB Atlas');
        console.error('  • 💡 Check: MongoDB Atlas IP whitelist (should be 0.0.0.0/0)');
        console.error('  • 💡 Try: Increasing serverSelectionTimeoutMS');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.error('  • ❌ DNS Resolution Failed');
        console.error('  • 💡 Check: Internet connection');
        console.error('  • 💡 Check: DNS server availability');
        console.error('  • 💡 Check: MongoDB host name is correct');
    }
    
    console.error('\n═'.repeat(60));
    console.error('');
}

// ============================================
// MAIN CONNECTION FUNCTION
// ============================================
async function dbConnect() {
    // Return existing cached connection
    if (cached.conn) {
        console.log('[DB] ✅ Using cached connection');
        return cached.conn;
    }

    // Create new connection if not in progress
    if (!cached.promise) {
        console.log('\n[DB] 🔄 Initiating new MongoDB connection...');
        console.log('[DB] IPv4 Mode: FORCED (family: 4)');

        cached.promise = mongoose.connect(MONGODB_URI, mongooseOptions)
            .then(async (mongoose) => {
                console.log('\n✅ [MONGODB] CONNECTION SUCCESS!');
                console.log('═'.repeat(60));
                console.log('📊 Connection Details:');
                console.log('  • Database Name:', mongoose.connection.name);
                console.log('  • Host:', mongoose.connection.host);
                console.log('  • Port:', mongoose.connection.port);
                console.log('  • State:', mongoose.connection.readyState === 1 ? 'CONNECTED' : 'UNKNOWN');
                console.log('═'.repeat(60));

                // Run connection test
                await testMongoDBConnection();

                return mongoose;
            })
            .catch((err) => {
                console.error('\n❌ [MONGODB] CONNECTION FAILED!');
                logConnectionError(err);
                cached.promise = null; // Reset promise on error
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
        console.log('[DB] ✅ Connection promise resolved, ready for queries');
    } catch (e) {
        cached.promise = null;
        console.error('[DB] ❌ Failed to establish connection');
        logConnectionError(e);
        throw new Error(`MongoDB Connection Error: ${e.message}`);
    }

    return cached.conn;
}

// ============================================
// DISCONNECTION FUNCTION
// ============================================
async function dbDisconnect() {
    if (cached.conn) {
        await mongoose.disconnect();
        cached.conn = null;
        cached.promise = null;
        console.log('[DB] ✅ Disconnected from MongoDB');
    }
}

export default dbConnect;
export { testMongoDBConnection, dbDisconnect };
