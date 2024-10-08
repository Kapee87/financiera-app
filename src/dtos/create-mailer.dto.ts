/* eslint-disable */
/**
 * DTO para crear un correo electrónico
 *
 * @property {Address} from - Remitente del correo electrónico
 * @property {Address[]} recipients - Destinatarios del correo electrónico
 * @property {string} subject - Asunto del correo electrónico
 * @property {string} to - Destinatario del correo electrónico
 * @property {string} html - Contenido HTML del correo electrónico
 * @property {string} [text] - Contenido de texto plano del correo electrónico
 * @property {Record<string, string>} [placeholderReplacements] - Reemplazos de placeholders en el contenido del correo electrónico
 */
import { Address } from 'nodemailer/lib/mailer';

export class CreateMailerDto {
  from?: Address;
  recipients: Address[];
  subject: string;
  to: string;
  html: string;
  text?: string;
  placeholderReplacements?: Record<string, string>;
}
