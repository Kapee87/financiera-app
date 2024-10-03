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
import { CurrencyService } from '../currency/currency.service';
import { SubOfficeService } from '../sub_office/sub_office.service';

@Injectable()
export class CashRegisterService {
  constructor(
    @InjectModel(CashRegister.name)
    private cashRegisterModel: Model<CashRegisterDocument>,
    private currencyService: CurrencyService,
    private subOfficeService: SubOfficeService,
  ) {}

  private truncateDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  async startDay(
    createCashRegisterDto: CreateCashRegisterDto,
  ): Promise<CashRegister> {
    const existingRegister = await this.getCurrentCashRegisterForSubOffice(
      createCashRegisterDto.sub_office,
    );
    if (existingRegister) {
      throw new Error('Ya existe una caja abierta para esta sub-oficina hoy');
    }

    if (createCashRegisterDto.date === undefined) {
      createCashRegisterDto.date = this.truncateDate(new Date());
    } else {
      createCashRegisterDto.date = this.truncateDate(
        new Date(createCashRegisterDto.date),
      );
    }

    const cashRegister = new this.cashRegisterModel({
      ...createCashRegisterDto,
      closing_balance: createCashRegisterDto.opening_balance,
      total_income: 0,
      total_expenses: 0,
      difference: 0,
    });

    // Actualizar el stock de ARS en la sub-oficina
    await this.updateARSStock(
      createCashRegisterDto.sub_office,
      createCashRegisterDto.opening_balance,
    );

    return cashRegister.save();
  }

  private async updateARSStock(
    subOfficeId: string,
    amount: number,
  ): Promise<void> {
    const arsCurrency = await this.currencyService.findByCode('ARS');
    if (!arsCurrency) {
      throw new NotFoundException('No se encontró la moneda ARS');
    }

    await this.subOfficeService.updateCurrencyStock(
      subOfficeId,
      arsCurrency._id.toString(),
      amount,
      'set',
    );
    await this.currencyService.updateGlobalStock(
      arsCurrency._id.toString(),
      amount,
      'set',
    );
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

  async updateCashRegister(subOfficeId: string, amount: number): Promise<void> {
    const cashRegister =
      await this.getCurrentCashRegisterForSubOffice(subOfficeId);
    if (!cashRegister) {
      throw new NotFoundException(
        `No se encontró una caja abierta para la sub-oficina con ID ${subOfficeId}`,
      );
    }

    cashRegister.closing_balance += amount;
    if (amount > 0) {
      cashRegister.total_income += amount;
    } else {
      cashRegister.total_expenses += Math.abs(amount);
    }

    await cashRegister.save();
  }

  async getCurrentCashRegisterForSubOffice(
    subOfficeId: string,
  ): Promise<CashRegisterDocument | null> {
    const today = this.truncateDate(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.cashRegisterModel
      .findOne({
        sub_office: subOfficeId,
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      })
      .exec();
  }

  async getCashRegisterByDate(date: string): Promise<CashRegister> {
    return this.cashRegisterModel.findOne({ date });
  }

  async listAllCashRegisters(): Promise<CashRegister[]> {
    return this.cashRegisterModel.find();
  }

  // Método para desarrollo, usar con precaución
  async deleteAllForDevelopment(): Promise<any> {
    return this.cashRegisterModel.deleteMany();
  }
}
