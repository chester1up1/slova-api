import { IsString } from 'class-validator';

export class VerificationDto {
  @IsString()
  _id: string;
  @IsString()
  verificationCode: string;
  @IsString()
  fingerprint: string;
}
