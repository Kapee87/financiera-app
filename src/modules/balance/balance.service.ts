/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Balance } from 'src/schemas/balance.schema';

@Injectable()
export class BalanceService {
  constructor(@InjectModel('Balance') private balanceModel: Model<Balance>) {}

  async findAll(): Promise<Balance[]> {
    return this.balanceModel.find().exec();
  }

  async findOne(id: string): Promise<Balance> {
    return this.balanceModel.findById(id).exec();
  }
  
}
