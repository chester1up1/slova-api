import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Words, WordsDocument } from './schemas/words.schema';

@Injectable()
export class WordsService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Words.name) private readonly wordsModel: Model<WordsDocument>,
  ) {}

  private static getRandomArrayInt({
    max,
    count = 1,
  }: {
    max: number;
    count?: number;
  }): number[] {
    const result = [];

    while (result.length !== count) {
      const rnd = Math.floor(Math.random() * max);

      if (!result.includes(rnd)) {
        result.push(rnd);
      }
    }

    return result;
  }

  async insertWords(words: string[]) {
    return this.wordsModel.create({
      initial: words,
    });
  }

  async getWord({
    collection,
    count = 1,
  }: {
    collection: string;
    count?: number;
  }) {
    const id = '65b82af669734d7b7a4284a0';
    const value = await this.wordsModel.findById(id);

    const words = value[collection] as string[];
    const rnd = WordsService.getRandomArrayInt({ max: words.length, count });

    const result = [];

    for (let index = 0; index < rnd.length; index++) {
      result.push(
        this.jwtService.sign(
          { value: words[rnd[index]] },
          {
            expiresIn: '1 day',
          },
        ),
      );
    }

    return result;
  }
}
