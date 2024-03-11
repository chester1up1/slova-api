import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

@Controller('email')
export class EmailController {
  constructor(private mailService: MailerService) {}

  @Get('plain-text-email')
  async plainTextEmail(@Query('toemail') toemail: string) {
    await this.mailService.sendMail({
      to: toemail,
      from: 'slova.adm@gmail.com',
      subject: 'First email',
      text: 'Hello world',
    });
  }

  @Post('html-email')
  async postHTMLEmail(
    @Body() superHero: any,
    @Query('toemail') toemail: string,
  ) {
    const response = await this.mailService.sendMail({
      to: toemail,
      from: 'slova.adm@gmail.com',
      subject: 'HTML Dynamic Template',
      template: 'superhero',
      context: {
        superHero: superHero,
      },
    });
    return {
      message: 'succenss',
      response,
    };
  }
}
