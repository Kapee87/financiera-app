/* eslint-disable */
/* eslint-disable */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mongoose } from 'mongoose';
import { ClientSchema } from 'src/schemas/clients.schema';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Client', schema: ClientSchema }]),
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
