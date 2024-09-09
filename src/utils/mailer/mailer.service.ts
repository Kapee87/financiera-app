/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CreateMailerDto } from 'src/dtos/create-mailer-dto';

@Injectable()
export class MailerService {
  constructor(private readonly configService: ConfigService) {}

  mailTransport() {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAILER_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // true for port 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAILER_USER'),
        pass: this.configService.get<string>('MAILER_PASSWORD'),
      },
    });

    return transporter;
  }
  async sendMail(createMailerDto: CreateMailerDto) {
    const {
      from,
      recipients,
      subject,
      html,
      placeholderReplacements,
      to,
      text,
    } = createMailerDto;
    const transport = this.mailTransport();
    const mailOptions = {
      from: from ?? {
        name: this.configService.get<string>('APP_NAME'),
        address: this.configService.get<string>('DEAFAULT_MAILER_FROM'),
      },
      to: recipients,
      text: text,
      subject,
      html,
    };
    try {
      const result = await transport.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
