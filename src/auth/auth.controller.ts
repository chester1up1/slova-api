import {
  Body,
  Controller,
  Post,
  Req,
  Response,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request, Response as Res } from 'express';
import { RealIp } from 'nestjs-fingerprint';
import { AuthService } from './auth.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SignupDto } from './dto/signup';
import { VerificationDto } from './dto/verification.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async createUser(@Body() SignupDto: SignupDto): Promise<{ userId: string }> {
    const { password } = SignupDto;
    const hashedPassword = await bcrypt.hash(
      password,
      +process.env.SALT_OR_ROUNDS,
    );

    const result = await this.authService.signup({
      ...SignupDto,
      password: hashedPassword,
    });

    return result;
  }

  @Post('/verification')
  async verification(
    @Body() verificationDto: VerificationDto,
    @Req() req: Request,
    @RealIp() ip: string,
    @Response({ passthrough: true }) res,
  ) {
    return this.authService.verification(req, res, ip, verificationDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async login(
    @Req() req: Request,
    @Response({ passthrough: true }) res: Res,
    @RealIp() ip: string,
  ) {
    return this.authService.signin(req, res, ip, 'fingerprint');
  }

  @Post('/refresh-tokens')
  async refresh(
    @Req() req: Request,
    @RealIp() ip: string,
    @Response({ passthrough: true }) res,
  ) {
    return this.authService.refresh(req, res, 'fingerprint', ip);
  }

  @Post('/signout')
  async signout(
    @Req() req: Request,
    @Response({ passthrough: true }) res: Res,
  ) {
    return this.authService.signout(req, res);
  }
}
