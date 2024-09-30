/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CashRegister } from 'src/schemas/cash_registers.schema';
import { CompanyCashRegister } from 'src/schemas/company_cash_registers.schema';

@Injectable()
export class CompanyCashRegisterService {
  constructor(
    @InjectModel(CompanyCashRegister.name)
    private readonly companyCashRegisterModel: Model<CompanyCashRegister>,
    @InjectModel(CashRegister.name)
    private readonly cashRegisterModel: Model<CashRegister>,
  ) {}

  async generateDailyReport(date: string): Promise<CompanyCashRegister> {
    const cashRegisters = await this.cashRegisterModel.find({ date });

    if (cashRegisters.length === 0) {
      throw new Error(`No se encontraron registros para la fecha ${date}`);
    }

    const totalOpeningBalance = cashRegisters.reduce(
      (sum, reg) => sum + reg.opening_balance,
      0,
    );
    const totalClosingBalance = cashRegisters.reduce(
      (sum, reg) => sum + reg.closing_balance,
      0,
    );
    const totalIncome = cashRegisters.reduce(
      (sum, reg) => sum + reg.total_income,
      0,
    );
    const totalExpenses = cashRegisters.reduce(
      (sum, reg) => sum + reg.total_expenses,
      0,
    );
    const difference = totalClosingBalance - totalOpeningBalance;

    try {
      const companyCashRegister = await this.companyCashRegisterModel.create({
        date,
        total_opening_balance: totalOpeningBalance,
        total_closing_balance: totalClosingBalance,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        difference,
      });

      return companyCashRegister;
    } catch (error) {
      throw new Error('Error al generar el reporte diario');
    }
  }
}
