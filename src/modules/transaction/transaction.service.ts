/* eslint-disable */
/**
 * Servicio para la gestión de transacciones
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar transacciones
 *
  
 * @version 1.0.0
 * @since 2020-07-20
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from 'src/schemas/transaction.schema';
import { SubOfficeService } from '../sub_office/sub_office.service';
import { CurrencyService } from '../currency/currency.service';
import { CashRegisterService } from '../cash_register/cash_register.service';
import { CreateTransactionDto } from 'src/dtos/create-transaction.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TransactionService {
  /**
   * Constructor del servicio
   *
   * Inicializa el servicio con los modelos y servicios necesarios
   *
   * @param transactionModel Modelo de transacciones
   * @param subOfficeService Servicio de sucursales
   * @param currencyService Servicio de monedas
   * @param cashService Servicio de cajas
   * @param userService Servicio de usuarios
   */
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private subOfficeService: SubOfficeService,
    private currencyService: CurrencyService,
    private cashService: CashRegisterService,
    private userService: UsersService,
  ) {}

  /**
   * Crea una nueva transacción
   *
   * Crea una nueva transacción con los datos proporcionados y actualiza los stocks
   * y la caja correspondientes
   *
   * @param createTransactionDto Datos de la transacción a crear
   * @returns La transacción creada
   */
  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const {
      user,
      subOffice,
      sourceCurrency,
      targetCurrency,
      type,
      amount,
      exchangeRate,
    } = createTransactionDto;

    // Obtener datos de usuario, sucursal y monedas
    const userData = await this.userService.findOneById(user.toString());
    const subOfficeData = await this.subOfficeService.findOne(
      subOffice.toString(),
    );
    const sourceCurrencyData = await this.currencyService.findOne(
      sourceCurrency.toString(),
    );
    const targetCurrencyData = await this.currencyService.findOne(
      targetCurrency.toString(),
    );

    // Calcular el otro monto basado en la tasa de cambio
    let sourceAmount: number;
    let targetAmount: number;
    if (type === 'buy') {
      sourceAmount = amount;
      targetAmount = amount * exchangeRate;
    } else {
      // sell or exchange
      targetAmount = amount;
      sourceAmount = amount / exchangeRate;
    }

    // Verificar y actualizar stocks
    await this.updateStocks(
      subOffice.toString(),
      sourceCurrency.toString(),
      targetCurrency.toString(),
      sourceAmount,
      targetAmount,
      type,
    );

    // Manejar la caja
    await this.handleCashRegister(
      subOffice.toString(),
      type,
      sourceAmount,
      targetAmount,
      exchangeRate,
    );

    const transaction = new this.transactionModel({
      ...createTransactionDto,
      userName: userData.username,
      subOfficeName: subOfficeData.name,
      sourceCurrencyCode: sourceCurrencyData.code,
      targetCurrencyCode: targetCurrencyData.code,
      sourceAmount,
      targetAmount,
    });

    return transaction.save();
  }

  /**
   * Actualiza los stocks de la sucursal y las monedas correspondientes
   *
   * @param subOfficeId Identificador de la sucursal
   * @param sourceCurrencyId Identificador de la moneda fuente
   * @param targetCurrencyId Identificador de la moneda destino
   * @param sourceAmount Monto de la moneda fuente
   * @param targetAmount Monto de la moneda destino
   * @param type Tipo de transacción (buy, sell o exchange)
   */
  private async updateStocks(
    subOfficeId: string,
    sourceCurrencyId: string,
    targetCurrencyId: string,
    sourceAmount: number,
    targetAmount: number,
    type: string,
  ): Promise<void> {
    if (type === 'buy') {
      await this.subOfficeService.updateCurrencyStock(
        subOfficeId,
        sourceCurrencyId,
        sourceAmount,
        'increase',
      );
      await this.subOfficeService.updateCurrencyStock(
        subOfficeId,
        targetCurrencyId,
        targetAmount,
        'decrease',
      );
    } else if (type === 'sell') {
      await this.subOfficeService.updateCurrencyStock(
        subOfficeId,
        sourceCurrencyId,
        sourceAmount,
        'decrease',
      );
      await this.subOfficeService.updateCurrencyStock(
        subOfficeId,
        targetCurrencyId,
        targetAmount,
        'increase',
      );
    } else if (type === 'exchange') {
      await this.subOfficeService.updateCurrencyStock(
        subOfficeId,
        sourceCurrencyId,
        sourceAmount,
        'decrease',
      );
      await this.subOfficeService.updateCurrencyStock(
        subOfficeId,
        targetCurrencyId,
        targetAmount,
        'increase',
      );
    }

    // Actualizar stocks globales
    await this.currencyService.updateGlobalStock(
      sourceCurrencyId,
      sourceAmount,
      type === 'buy' ? 'increase' : 'decrease',
    );
    await this.currencyService.updateGlobalStock(
      targetCurrencyId,
      targetAmount,
      type === 'sell' ? 'increase' : 'decrease',
    );
  }

  /**
   * Maneja la caja de la sucursal correspondiente
   *
   * @param subOfficeId Identificador de la sucursal
   * @param type Tipo de transacción (buy, sell o exchange)
   * @param sourceAmount Monto de la moneda fuente
   * @param targetAmount Monto de la moneda destino
   * @param exchangeRate Tasa de cambio
   */
  private async handleCashRegister(
    subOfficeId: string,
    type: string,
    sourceAmount: number,
    targetAmount: number,
    exchangeRate: number,
  ): Promise<void> {
    let cashChange = 0;

    if (type === 'buy') {
      cashChange = -targetAmount; // Salida de efectivo en moneda local
    } else if (type === 'sell') {
      cashChange = sourceAmount; // Entrada de efectivo en moneda local
    }

    await this.cashService.updateCashRegister(subOfficeId, cashChange);
  }

  /**
   * Obtiene todas las transacciones
   *
   * @returns Un array de transacciones
   */
  async findAll(): Promise<Transaction[]> {
    const transactions = await this.transactionModel.find().exec();
    return Promise.all(
      transactions.map((transaction) =>
        this.populateTransactionData(transaction),
      ),
    );
  }

  /**
   * Obtiene una transacción por su ID
   *
   * @param id Identificador de la transacción
   * @returns La transacción encontrada o null si no existe
   */
  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return this.populateTransactionData(transaction);
  }

  /**
   * Actualiza una transacción
   *
   * @param id Identificador de la transacción
   * @param transactionData Datos de la transacción a actualizar
   * @returns La transacción actualizada
   */
  async update(
    id: string,
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    return this.transactionModel
      .findByIdAndUpdate(id, transactionData, { new: true })
      .exec();
  }

  /**
   * Elimina una transacción
   *
   * @param id Identificador de la transacción
   * @returns La transacción eliminada
   */
  async delete(id: string): Promise<Transaction> {
    return this.transactionModel.findByIdAndDelete(id).exec();
  }
  private async getUserData(userId: string) {
    try {
      const user = await this.userService.findOneById(userId);
      return { name: user.username };
    } catch (error) {
      return { name: 'Usuario no disponible' };
    }
  }

  private async getSubOfficeData(subOfficeId: string) {
    try {
      const subOffice = await this.subOfficeService.findOne(subOfficeId);
      return { name: subOffice.name };
    } catch (error) {
      return { name: 'Sucursal no disponible' };
    }
  }

  private async getCurrencyData(currencyId: string) {
    try {
      const currency = await this.currencyService.findOne(currencyId);
      return { code: currency.code };
    } catch (error) {
      return { code: 'Moneda no disponible' };
    }
  }

  /**
   * Pobla los datos de usuario, sucursal y moneda en una transacción
   *
   * @param transaction La transacción a poblar
   * @returns La transacción con los datos poblados
   */
  private async populateTransactionData(
    transaction: TransactionDocument,
  ): Promise<Transaction> {
    const [userData, subOfficeData, sourceCurrencyData, targetCurrencyData] =
      await Promise.all([
        this.getUserData(transaction.user.toString()),
        this.getSubOfficeData(transaction.subOffice.toString()),
        this.getCurrencyData(transaction.sourceCurrency.toString()),
        this.getCurrencyData(transaction.targetCurrency.toString()),
      ]);
    return {
      ...transaction.toObject(),
      userName: userData.name,
      subOfficeName: subOfficeData.name,
      sourceCurrencyCode: sourceCurrencyData.code,
      targetCurrencyCode: targetCurrencyData.code,
    };
  }
}
