/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailController } from './email/email.controller';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { NestjsFingerprintModule } from 'nestjs-fingerprint';
import { WordsModule } from './words/words.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      `mongodb+srv://vladyslavsamoylyk:${process.env.MONGODB_PASSWORD}@cluster0.og77rny.mongodb.net/`,
    ),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.sendgrid.net',
        auth: {
          user: 'apikey',
          pass: process.env.SG_USER_PASS,
        },
      },
      // template: {
      //   dir: join(__dirname, 'email/mails'),
      //   adapter: new HandlebarsAdapter(),
      // },
    }),
    NestjsFingerprintModule.forRoot({
      params: ['headers', 'userAgent', 'ipAddress'],
      // cookieOptions: {
      //   name: 'your_cookie_name', // optional
      //   httpOnly: true, // optional
      // },
    }),
    UserModule,
    AuthModule,
    WordsModule,
  ],
  controllers: [EmailController],
  providers: [],
})
export class AppModule {}
