/* eslint-disable */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MovementSchema } from 'src/schemas/movement.schema';
import { MovementController } from './movements.controller';
import { MovementService } from './movements.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Movement', schema: MovementSchema }]),
  ],
  controllers: [MovementController],
  providers: [MovementService],
})
export class MovementModule {}
