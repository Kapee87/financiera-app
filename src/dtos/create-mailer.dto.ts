/* eslint-disable */
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
