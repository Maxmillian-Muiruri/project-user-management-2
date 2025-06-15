import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendMail(dto: SendEmailDto): Promise<void> {
    await this.mailerService.sendMail({
      to: dto.to,
      subject: dto.subject,
      template: 'assignment', // file: templates/assignment.hbs or .ejs
      context: {
        name: dto.name,
        project: dto.project,
      },
    });
  }
}
