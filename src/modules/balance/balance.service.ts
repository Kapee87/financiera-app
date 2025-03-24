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
   *
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
    const balance = await this.balanceModel.find().populate('subOffice').exec();
    return balance;
  }

  /**
   * Filtrar balances por fecha o por sucursal
   * @returns {Promise<Balance[]>} Un array con los balances filtrados
   */
  async filterBalances(subOfficeId?: string, startDate?: Date, endDate?: Date) {
    try {
      console.log('subOfficeId: ', subOfficeId);
      console.log('startDate: ', startDate);
      console.log('endDate: ', endDate);

      let filters: any = {};
      if (subOfficeId) {
        filters.subOffice = subOfficeId;
      }
      if (startDate && endDate) {
        let allDay = endDate.setUTCHours(23, 59, 59, 999);

        filters.createdAt = { $gte: startDate, $lte: allDay };
      }

      if (subOfficeId && startDate && endDate) {
        let allDay = endDate.setUTCHours(23, 59, 59, 999);

        filters.subOffice = subOfficeId;
        filters.createdAt = { $gte: startDate, $lte: allDay };
      }

      const balances = await this.balanceModel.find(filters).exec();

      if (balances.length === 0) {
        return {
          message: 'No se encontraron balances',
        };
      }
      return balances;
    } catch (error) {
      throw error;
    }
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

    /* Verifica que haya caja abierta, sino da error */
    const cashRegister: any =
      await this.cash_registerService.getCurrentCashRegisterForSubOffice(
        subOfficeId,
      );

    console.log('CashRegister: ', cashRegister);

    if (!cashRegister) {
      throw new ConflictException('No hay caja abierta');
    }
    /* calcula el total de movimientos (devuelve ingresos y egresos en USD) */
    const movements = await this.cash_registerService.calculateMovementTotals(
      subOfficeId,
      today,
      usdRate,
    );

    /* calcula el total de transacciones (devuelve ingresos , egresos y cheques en USD) */
    const transactions =
      await this.cash_registerService.calculateTransactionTotals(
        subOfficeId,
        today,
        usdRate,
      );
    /* calcula el total de stock */
    const currentStockUSD =
      await this.cash_registerService.calculateCurrentStockTotal(
        subOfficeId,
        usdRate,
      );

    /* Verifica si ya existe un balance */
    const existingBalance = await this.balanceModel.findOne({
      subOffice: subOfficeId,
      createdAt: { $gte: today },
    });

    /* Calcula ganancias de movimientos y transacciones para luego calcular el total de ganancia */
    const movementsProfit = movements.incomeUSD - movements.expensesUSD;
    const transactionsProfit =
      transactions.totalIncomeUSD +
      transactions.checkIncomeUSD -
      transactions.totalExpensesUSD;
    const totalProfit = Number(
      (movementsProfit + transactionsProfit).toFixed(2),
    );

    /* Si ya existe un balance lo actualiza */
    if (existingBalance) {
      existingBalance.totalExpensesUSD = movements.expensesUSD; //egresos movimientos
      existingBalance.totalIncomeUSD = movements.incomeUSD; //ingresos movimientos
      existingBalance.totalIncomeUSD =
        transactions.totalIncomeUSD + transactions.checkIncomeUSD; //ingresos transacciones(ganancia)
      existingBalance.totalProfit = totalProfit; //ganancia total

      existingBalance.currentStockUSD = currentStockUSD;

      await existingBalance.save();
      /* Si no existe un balance lo crea */
    } else {
      const balance = new this.balanceModel({
        subOffice: subOfficeId,
        subOfficeName: cashRegister.sub_office.name,
        date: today,
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
  async deleteAll(): Promise<string> {
    0;
    try {
      await this.balanceModel.deleteMany({}).exec();
      return 'All balances deleted';
    } catch (error) {
      return error;
    }
  }
}
