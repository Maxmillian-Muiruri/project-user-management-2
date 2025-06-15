import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendMail({ to, subject, text }: SendEmailDto): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  }
}
