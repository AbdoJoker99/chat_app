import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DatabaseModule } from './utils/database.module';
import { AllExceptionsFilter } from './utils/exceptions';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import configuration from './config/configuration';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/strategies/jwt.strategy';

@Module({
  imports: [
    // 1️⃣ Global Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // 2️⃣ Database Connection
    DatabaseModule,

    // 3️⃣ GraphQL Configuration (Apollo v4 compatible)
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        playground: true,                      // Enable GraphQL Playground
        autoSchemaFile: 'schema.gql',          // Auto-generate schema file
        sortSchema: true,                      // Optional: sort schema for consistency
        context: ({ req }) => ({ req }),       // ✅ Fix: Only `req`, no `connection`
        subscriptions: {
          'graphql-ws': true,                  // Enable modern WebSocket subscriptions
        },
      }),
    }),

    // 4️⃣ Passport & JWT Setup
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),

    // 5️⃣ Core Application Modules
    UserModule,
    AuthModule,
    ChatModule,
  ],

  providers: [
    // 6️⃣ Global Providers
    JwtStrategy,

    // Apply Global ValidationPipe
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },

    // Apply Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
