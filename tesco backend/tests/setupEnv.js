import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MONGODB_URI) {
  const mongod = await MongoMemoryServer.create();
  let uri = mongod.getUri();
  if (uri.endsWith('/')) uri = uri.slice(0, -1);
  process.env.MONGODB_URI = uri;
  global.__MONGOD__ = mongod;
}
