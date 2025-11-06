import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET || 'SUPER_SECRET_KEY',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  database: {
    uri: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/nestjs-chat-app',
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/redirect',
  },
}));