import { ProjectService } from './project.service';
import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { MailerModule } from 'src/mailer/mailer.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [MailerModule, PrismaModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
