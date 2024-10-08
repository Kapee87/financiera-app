/* eslint-disable */
/**
 * Servicio para enviar correos electrónicos.
 *
 * Permite configurar la conexión con el servidor SMTP y
 * enviar correos electrónicos.
 *
  Luis Alberto Méndez López
 * @version 1.0
 * @since 2022-05-05
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CreateMailerDto } from 'src/dtos/create-mailer.dto';

/**
 * Interfaz para la configuración del servicio de correos.
 *
 * Permite configurar el host, el puerto, el usuario y la clave
 * para la conexión con el servidor SMTP.
 */
export interface MailerConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

/**
 * Servicio para enviar correos electrónicos.
 *
 * Permite configurar la conexión con el servidor SMTP y
 * enviar correos electrónicos.
 */
@Injectable()
export class MailerService {
  /**
   * Constructor del servicio.
   *
   * Recibe la configuración del servicio de correos y la
   * utiliza para configurar la conexión con el servidor SMTP.
   *
   * @param configService Servicio que proporciona la configuración del servicio de correos.
   */
  constructor(private readonly configService: ConfigService) {}

  /**
   * Configura la conexión con el servidor SMTP.
   *
   * Utiliza la configuración del servicio de correos para
   * configurar la conexión con el servidor SMTP.
   *
   * @returns La conexión configurada con el servidor SMTP.
   */
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

  /**
   * Envia un correo electrónico.
   *
   * Utiliza la conexión configurada con el servidor SMTP para
   * enviar el correo electrónico.
   *
   * @param createMailerDto Contiene los datos del correo electrónico a enviar.
   * @returns El resultado de enviar el correo electrónico.
   */
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
