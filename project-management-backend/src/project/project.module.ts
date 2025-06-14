import { ProjectService } from './project.service';
import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
