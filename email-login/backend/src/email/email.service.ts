import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';

@Injectable()
export class EmailService {
  transport: Transporter;

  constructor(private configService: ConfigService) {
    this.transport = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get('email_user'),
        pass: this.configService.get('email_password'),
      },
    });
  }

  async sendMail({ to, subject, html }) {
    await this.transport.sendMail({
      from: {
        name: '系统邮件',
        address: this.configService.get('email_user'),
      },
      to,
      subject,
      html,
    });
  }
}
