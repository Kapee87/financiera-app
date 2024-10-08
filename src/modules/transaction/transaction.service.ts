/* eslint-disable */
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
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private subOfficeService: SubOfficeService,
    private currencyService: CurrencyService,
    private cashService: CashRegisterService,
    private userService: UsersService,
  ) {}

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

    // Calculate the other amount based on the exchange rate
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

  async findAll(): Promise<Transaction[]> {
    const transactions = await this.transactionModel.find().exec();
    return Promise.all(
      transactions.map((transaction) =>
        this.populateTransactionData(transaction),
      ),
    );
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return this.populateTransactionData(transaction);
  }

  async update(
    id: string,
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    return this.transactionModel
      .findByIdAndUpdate(id, transactionData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Transaction> {
    return this.transactionModel.findByIdAndDelete(id).exec();
  }

  //métodos para manejar los datos de usuario, sucursal y moneda; cuando no hay datos disponibles, se muestra el nombre '${dato} no disponible'

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
