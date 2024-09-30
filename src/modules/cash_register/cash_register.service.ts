/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CashRegister,
  CashRegisterDocument,
} from 'src/schemas/cash_registers.schema';
import { CreateCashRegisterDto } from 'src/dtos/create-cash-register.dto';
import { UpdateCashRegisterDto } from 'src/dtos/update-cash-register.dto';

@Injectable()
export class CashRegisterService {
  constructor(
    @InjectModel(CashRegister.name)
    private cashRegisterModel: Model<CashRegisterDocument>,
  ) {}

  async startDay(
    createCashRegisterDto: CreateCashRegisterDto,
  ): Promise<CashRegister> {
    const existingRegister = await this.getCurrentCashRegisterForSubOffice(
      createCashRegisterDto.sub_office,
    );
    if (existingRegister) {
      throw new Error('Ya existe una caja abierta para esta sub-oficina hoy');
    }
    const cashRegister = new this.cashRegisterModel({
      ...createCashRegisterDto,
      closing_balance: createCashRegisterDto.opening_balance, // Inicializamos con el saldo de apertura
      total_income: 0,
      total_expenses: 0,
      difference: 0,
    });
    return cashRegister.save();
  }

  async closeDay(
    id: string,
    updateCashRegisterDto: UpdateCashRegisterDto,
  ): Promise<CashRegister> {
    const cashRegister = await this.cashRegisterModel.findById(id);
    if (!cashRegister) {
      throw new NotFoundException(`La caja diaria con ID ${id} no existe`);
    }

    cashRegister.closing_balance = updateCashRegisterDto.closing_balance;
    cashRegister.total_income = updateCashRegisterDto.total_income;
    cashRegister.total_expenses = updateCashRegisterDto.total_expenses;
    cashRegister.difference =
      cashRegister.closing_balance - cashRegister.opening_balance;

    return cashRegister.save();
  }

  async updateCashRegister(
    subOfficeId: string,
    amount: number,
    commission: number,
  ): Promise<void> {
    const cashRegister =
      await this.getCurrentCashRegisterForSubOffice(subOfficeId);
    if (!cashRegister) {
      throw new NotFoundException(
        `No se encontró una caja abierta para la sub-oficina con ID ${subOfficeId}`,
      );
    }

    cashRegister.closing_balance += amount;
    cashRegister.total_income += amount > 0 ? amount : 0;
    cashRegister.total_expenses += amount < 0 ? -amount : 0;
    cashRegister.total_income += commission;

    await cashRegister.save();
  }

  async getCurrentCashRegisterForSubOffice(
    subOfficeId: string,
  ): Promise<CashRegisterDocument | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.cashRegisterModel
      .findOne({
        sub_office: subOfficeId,
        date: today,
      })
      .exec();
  }

  async getCashRegisterByDate(date: string): Promise<CashRegister> {
    return this.cashRegisterModel.findOne({ date });
  }

  async listAllCashRegisters(): Promise<CashRegister[]> {
    return this.cashRegisterModel.find();
  }
  async addCommission(subOfficeId: string, commission: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const updatedCashRegister = await this.cashRegisterModel
      .findOneAndUpdate(
        {
          sub_office: subOfficeId,
          date: today,
        },
        {
          $inc: {
            total_income: commission,
            closing_balance: commission,
          },
        },
        { new: true },
      )
      .exec();

    if (!updatedCashRegister) {
      throw new NotFoundException(
        `No se encontro la caja diaria para la sub-oficina con ID ${subOfficeId}`,
      );
    }
  }
}
