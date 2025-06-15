import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
// This DTO is used for user login, ensuring that the email is valid and the password is provided.
// It can be used in the user controller to handle login requests, validating the input before processing the login logic.
