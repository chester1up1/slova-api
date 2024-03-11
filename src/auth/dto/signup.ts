import { IsString, IsEmail, IsStrongPassword } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;
  @IsString()
  username: string;
  @IsStrongPassword({ minSymbols: 0 })
  password: string;
}
