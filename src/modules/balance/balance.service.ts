/* eslint-disable */
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Balance } from 'src/schemas/balance.schema';
import { CashRegisterService } from '../cash_register/cash_register.service';
import { truncateDate } from 'src/utils/utilFunctions/utils';

@Injectable()
export class BalanceService {
  /**
   * Servicio para la gestion de balances
   *
   * Contiene metodos para obtener, calcular y eliminar balances
   *
   * @constructor
   * @param {Model<Balance>} balanceModel Modelo de balances
   * @param {CashRegisterService} cash_registerService Servicio para la gestion de cajas
   */
  constructor(
    @InjectModel('Balance')
    private balanceModel: Model<Balance>,
    private cash_registerService: CashRegisterService,
  ) {}

  /**
   * Obtiene todos los balances
   *
   * @returns {Promise<Balance[]>} Un array con todos los balances
   */
  async findAll(): Promise<Balance[]> {
    return this.balanceModel.find().exec();
  }

  /**
   * Obtiene un balance por su id
   *
   * @param {string} id El id del balance
   * @returns {Promise<Balance>} El balance encontrado
   */
  async findOne(id: string): Promise<Balance> {
    return this.balanceModel.findById(id).exec();
  }

  /**
   * Calcula un balance para una suboficina y un tipo de cambio
   *
   * @param {string} subOfficeId El id de la suboficina
   * @param {number} usdRate El tipo de cambio (1 USD = x ARS)
   * @returns {Promise<Balance>} El balance calculado
   */
  async calculateBalance(
    subOfficeId: string,
    usdRate: number,
  ): Promise<Balance> {
    const today = truncateDate(new Date());

    const cashRegister =
      await this.cash_registerService.getCurrentCashRegisterForSubOffice(
        subOfficeId,
      );

    if (!cashRegister) {
      throw new ConflictException('No hay caja abierta');
    }

    const movements = await this.cash_registerService.calculateMovementTotals(
      subOfficeId,
      today,
      usdRate,
    );

    const transactions =
      await this.cash_registerService.calculateTransactionTotals(
        subOfficeId,
        today,
        usdRate,
      );

    const currentStockUSD =
      await this.cash_registerService.calculateCurrentStockTotal(
        subOfficeId,
        usdRate,
      );

    const existingBalance = await this.balanceModel.findOne({
      subOffice: subOfficeId,
      createdAt: { $gte: today },
    });

    const movementsProfit = movements.incomeUSD - movements.expensesUSD;
    const transactionsProfit =
      transactions.totalIncomeUSD +
      transactions.checkIncomeUSD -
      transactions.totalExpensesUSD;
    const totalProfit = Number(
      (movementsProfit + transactionsProfit).toFixed(2),
    );

    if (existingBalance) {
      existingBalance.totalExpensesUSD = movements.expensesUSD; //egresos movimientos
      existingBalance.totalIncomeUSD = movements.incomeUSD; //ingresos movimientos
      existingBalance.totalIncomeUSD =
        transactions.totalIncomeUSD + transactions.checkIncomeUSD; //ingresos transacciones(ganancia)
      existingBalance.totalProfit = totalProfit; //ganancia total

      existingBalance.currentStockUSD = currentStockUSD;

      await existingBalance.save();
    } else {
      const balance = new this.balanceModel({
        subOffice: subOfficeId,
        totalExpensesUSD: movements.expensesUSD, //egresos movimientos
        totalIncomeUSD: movements.incomeUSD, //ingresos movimientos
        transactionsProfit:
          transactions.totalIncomeUSD + transactions.checkIncomeUSD, //ingresos transacciones(ganancia)
        totalProfit: totalProfit, //ganancia total
        currentStockUSD: currentStockUSD,
      });
      await balance.save();
      return balance;
    }
    return existingBalance;
  }

  /**
   * Elimina todos los balances
   *
   * @returns {Promise<string>} Un mensaje de confirmacion de eliminacion
   */
  async deleteAll(): Promise<string> {0
    try {
      await this.balanceModel.deleteMany({}).exec();
      return 'All balances deleted';
    } catch (error) {
      return error;
    }
  }
}
