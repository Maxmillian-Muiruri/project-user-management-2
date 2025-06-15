import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectService } from './project/project.service';
import { ProjectModule } from './project/project.module';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailerModule } from './mailer/mailer.module';




@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProjectModule,
    UserModule,
    PrismaModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService, ProjectService, UserService],
})
export class AppModule {}
