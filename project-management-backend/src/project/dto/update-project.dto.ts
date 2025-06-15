import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
// This file defines the UpdateProjectDto class, which extends CreateProjectDto

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
