import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Global reference to the In-Memory MongoDB Server so it can be terminated on process exits
let mongoMemoryServer: MongoMemoryServer | null = null;

/**
 * Initializes connection to the database.
 * 
 * Connection Strategy:
 * 1. Checks for a configured MONGO_URI environment variable (defaults to localhost:27017).
 * 2. Attempts a connection. Sets a low timeout (2.5s) to fail fast if no server is running.
 * 3. Fallback: If connection fails, spawns an isolated In-Memory MongoDB Server (`mongodb-memory-server`).
 *    This ensures that the server can run out of the box with zero external dependencies (no database setup required).
 */
export const connectDB = async (): Promise<void> => {
  try {
    // Read Mongo URI from env, falling back to local default
    let mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-resume';

    // Step 1: Try connecting to the primary MONGO_URI database
    try {
      await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 2500 });
      console.log(`[MongoDB] Connected successfully to primary URI: ${mongoose.connection.host}`);
    } catch (primaryErr) {
      // Step 2: Fallback to an In-Memory Mongo Database if connection fails
      console.warn(`[MongoDB] Primary connection (${mongoURI}) failed or unaccessible. Starting in-memory MongoDB database...`);

      // Initialize the mongodb-memory-server instance
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'ai-resume'
        }
      });
      const inMemoryURI = mongoMemoryServer.getUri();

      // Connect Mongoose to the newly created isolated in-memory DB URI
      await mongoose.connect(inMemoryURI);
      console.log(`[MongoDB] Connected successfully to In-Memory Database: ${inMemoryURI}`);
    }
  } catch (error) {
    // Hard crash if both connection methods fail
    console.error(`[MongoDB] Database Connection Error:`, error);
    process.exit(1);
  }
};
