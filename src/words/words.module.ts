import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Words, WordsSchema } from './schemas/words.schema';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    MongooseModule.forFeature([{ name: Words.name, schema: WordsSchema }]),
  ],
  providers: [WordsService],
  controllers: [WordsController],
})
export class WordsModule {}
