import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  duedate: Date;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  assignedUserId?: string;
}
