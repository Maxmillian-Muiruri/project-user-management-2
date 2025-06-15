// src/mailer/mailer.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendAssignmentEmail(to: string, projectTitle: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'New Project Assigned',
      template: 'assigned', // assigned.ejs
      context: {
        projectTitle,
      },
    });
  }

  async notifyAdminOnCompletion(adminEmail: string, projectTitle: string, userId: string): Promise<void> {
    await this.mailerService.sendMail({
      to: adminEmail,
      subject: 'Project Completed',
      template: 'completed', // completed.ejs
      context: {
        projectTitle,
        userId,
      },
    });
  }
}
