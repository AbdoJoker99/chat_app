import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { databaseConnectionFactory } from './database-connection.factory.ts.js';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConnectionFactory,
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
