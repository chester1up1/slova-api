import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getUser(req: any) {
    if (req.user != null) {
      const { userId } = req.user;
      console.log('req.user: ', req.user);

      console.log('userId: ', userId);

      const user = await this.userModel.findById(userId, {
        password: 0,
        verificationCode: 0,
      });
      console.log('user: ', user);

      return { user };
    }
    throw new ForbiddenException('Invalid access token');
  }
}
