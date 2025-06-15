import { Controller, Post, Body } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send')
  async send(@Body() dto: SendEmailDto) {
    await this.mailerService.sendMail(dto);
    return { message: 'Email sent successfully' };
  }
}
