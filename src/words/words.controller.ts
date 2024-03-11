import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WordsService } from './words.service';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post('initial')
  async initial(@Body('words') words: string[]) {
    return this.wordsService.insertWords(words);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getWords(
    @Body('collection') collection: string,
    @Body('count') count?: number,
  ) {
    return this.wordsService.getWord({ collection, count });
  }
}
