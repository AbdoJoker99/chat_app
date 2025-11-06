import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

/**
 * Database Connection Factory (A19)
 * Provides a clean and reusable factory for Mongoose connection.
 */
export const databaseConnectionFactory = (
  configService: ConfigService,
): MongooseModuleOptions => {
  // Get the MongoDB connection URI from environment/config
  const uri = configService.get<string>('DATABASE_URL') 
           || configService.get<string>('config.database.uri');

  if (!uri) {
    throw new Error('❌ DATABASE_URL or config.database.uri is not defined in environment.');
  }

  return {
    uri,
    retryAttempts: 5,           // Retry connection attempts before failing
    retryDelay: 3000,           // Delay between retries in ms
    autoIndex: true,            // Automatically build indexes
    serverSelectionTimeoutMS: 5000,
  };
};
