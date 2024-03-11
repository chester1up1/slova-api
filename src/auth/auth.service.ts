import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from 'src/user/user.schema';
import {
  RefresSession,
  RefresSessionDocument,
} from './schemas/refresh-session.schema';
import { Request, Response } from 'express';
import { SignupDto } from './dto/signup';
import ShortUniqueId from 'short-unique-id';
import { MailerService } from '@nestjs-modules/mailer';
import { VerificationDto } from './dto/verification.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RefresSession.name)
    private readonly refresSessionModel: Model<RefresSessionDocument>,
    private jwtService: JwtService,
    private mailSercive: MailerService,
  ) {}

  private static generateRefreshSession(
    sessionDto: Omit<RefresSession, 'createdAt' | '_id'>,
  ) {
    return {
      ...sessionDto,
      createdAt: +new Date(),
    };
  }

  private async getUser(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async validateUser(email: string, password: string): Promise<any> {
    console.log('email: ', email);

    const user = await this.getUser(email);

    if (!user) throw new NotAcceptableException('could not find the user');

    if (user.verificationCode != null)
      throw new ForbiddenException('User need verification');

    const passwordValid = await bcrypt.compare(password, user.password);

    if (user && passwordValid) return user;

    return null;
  }

  async signup(userDto: SignupDto) {
    const user = await this.userModel.findOne({ email: userDto.email });

    if (user != null) throw new ForbiddenException('User already exist');

    const { randomUUID } = new ShortUniqueId({ length: 5 });
    const verificationCode = randomUUID();

    const { _id } = await this.userModel.create({
      ...userDto,
      verificationCode,
    });

    const mailResult = await this.mailSercive
      .sendMail({
        to: userDto.email,
        from: 'slova.adm@gmail.com',
        subject: 'Rgistration verification code',
        text: `Code: ${verificationCode}`,
      })
      .catch((err) => {
        console.log('error: ', err);
      });

    if (mailResult == null) {
      this.userModel.findByIdAndDelete({ _id });
      throw new InternalServerErrorException();
    }

    return {
      userId: _id,
    };
  }

  async verification(
    req: any,
    res: Response,
    ip: string,
    verificationDto: VerificationDto,
  ) {
    // const user = await this.userModel.findByIdAndUpdate(verificationDto._id, {
    //   verificationCode: null,
    // });

    const find = {
      _id: verificationDto._id,
      verificationCode: verificationDto.verificationCode,
    };
    const user = await this.userModel.findOneAndUpdate(find, {
      verificationCode: null,
    });

    if (user != null) {
      req.user = {
        email: user.email,
        username: user.username,
        _id: user._id,
      };

      return this.signin(req, res, ip, verificationDto.fingerprint);
    }

    throw new ForbiddenException('Wrong verification code');
  }

  async signin(req: any, res: Response, ip: string, fingerprint: string) {
    const { user } = req;
    const payload = {
      email: user.email,
      username: user.username,
      sub: user._id,
    };
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + 60);

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '30 mins',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '60 days',
    });

    const refreshSession = AuthService.generateRefreshSession({
      ip,
      fingerprint,
      refreshToken,
      expiresIn: `${+expiresIn}`,
      userId: user._id,
      username: user.username,
      email: user.email,
    });

    this.refresSessionModel.create(refreshSession);

    res.cookie('refresh_token', refreshToken, {
      path: '/',
      expires: expiresIn,
      httpOnly: true,
    });

    return {
      access_token: accessToken,
    };
  }

  async signout(req: Request, res: Response) {
    const { refresh_token } = req.cookies;
    this.refresSessionModel.findOneAndDelete({
      refreshToken: refresh_token,
    });
    res.clearCookie('refresh_token');
    return {};
  }

  async refresh(req: Request, res: Response, fingerprint: string, ip: string) {
    const { refresh_token } = req.cookies;

    const refreshSession = await this.refresSessionModel.findOneAndDelete({
      refreshToken: refresh_token,
      fingerprint,
    });

    const refreshToken = this.jwtService.decode(refresh_token);
    const time = Math.floor(new Date().getTime() / 1000);

    if (refreshSession == null) throw new ForbiddenException('Session expired');
    if (refreshToken.exp - time <= 0)
      throw new ForbiddenException('Refresh token expired');

    const payload = {
      email: refreshSession.email,
      username: refreshSession.username,
      sub: refreshSession.userId,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '30 mins',
    });
    const new_refresh_token = this.jwtService.sign(payload, {
      expiresIn: '60 days',
    });
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + 60);

    const newRefreshSession = AuthService.generateRefreshSession({
      ip,
      fingerprint,
      refreshToken: new_refresh_token,
      expiresIn: `${+expiresIn}`,
      userId: refreshSession.userId,
      username: refreshSession.username,
      email: refreshSession.email,
    });

    this.refresSessionModel.create(newRefreshSession);

    res.cookie('refresh_token', new_refresh_token, {
      path: '/',
      expires: expiresIn,
      httpOnly: true,
    });

    return {
      access_token,
    };
  }
}

/*TODO:
 *[ ] - req: any
 *[ ] - mb moove refresh logic to guard?
 */
