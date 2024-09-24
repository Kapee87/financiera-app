/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateCashRegisterDto } from 'src/dtos/create-cash-register.dto';
import { UpdateCashRegisterDto } from 'src/dtos/update-cash-register.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CashRegister } from 'src/schemas/cash_registers.schema';

@Injectable()
export class CashRegisterService {
  constructor(
    @InjectModel(CashRegister.name)
    private cashRegisterModel: Model<CashRegister>,
  ) {}

  async startDay(
    createCashRegisterDto: CreateCashRegisterDto,
  ): Promise<CashRegister> {
    const cashRegister = new this.cashRegisterModel(createCashRegisterDto);
    return cashRegister.save();
  }

  async closeDay(
    id: string,
    updateCashRegisterDto: UpdateCashRegisterDto,
  ): Promise<CashRegister> {
    const cashRegister = await this.cashRegisterModel.findById(id);
    if (!cashRegister) {
      throw new Error(`Cash Register with ID ${id} not found`);
    }

    cashRegister.closing_balance = updateCashRegisterDto.closing_balance;
    cashRegister.total_income = updateCashRegisterDto.total_income;
    cashRegister.total_expenses = updateCashRegisterDto.total_expenses;
    cashRegister.difference =
      cashRegister.closing_balance - cashRegister.opening_balance;

    return cashRegister.save();
  }

  async getCashRegisterByDate(date: string): Promise<CashRegister> {
    return this.cashRegisterModel.findOne({ date });
  }

  async listAllCashRegisters(): Promise<CashRegister[]> {
    return this.cashRegisterModel.find();
  }
}
