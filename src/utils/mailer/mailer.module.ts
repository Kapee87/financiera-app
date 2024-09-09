/* eslint-disable */
import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
