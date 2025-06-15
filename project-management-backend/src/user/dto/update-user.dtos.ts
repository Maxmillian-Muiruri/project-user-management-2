/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Inherits all fields from CreateUserDto but makes them optional
}
