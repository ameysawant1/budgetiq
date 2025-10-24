import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || process.env.DATABASE_URL;
if (!uri) {
  // don't throw here; let callers handle missing env
  console.warn('MONGO_URI not set, Mongo operations will fail until configured.');
}

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  if (!uri) throw new Error('MONGO_URI is not defined');
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function getDb() {
  const client = await connectToDatabase();
  const dbName = process.env.MONGO_DB_NAME || 'budgetiq';
  return client.db(dbName);
}
