import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { PASSWORD_MAX_LENGTH } from "../../domain/password-policy";

/** No minimum length here on purpose: the policy applies when a password is chosen, not when it is used. */
export class SignInDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;
}
