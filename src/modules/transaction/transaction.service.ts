/* eslint-disable */
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private subOfficeService: SubOfficeService,
    private currencyService: CurrencyService,
    private cashService: CashRegisterService,
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
      sourceAmount,
      targetAmount,
      exchangeRate,
    } = createTransactionDto;

    const subOfficeData = await this.subOfficeService.findOne(
      subOffice.toString(),
    );
    const sourceCurrencyData = await this.currencyService.findOne(
      sourceCurrency.toString(),
    );
    const targetCurrencyData = await this.currencyService.findOne(
      targetCurrency.toString(),
    );

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

    // Crear la transacción
    const transaction = new this.transactionModel(createTransactionDto);
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
    return this.transactionModel
      .find()
      .populate('user', 'lastname email _id role')
      .populate('subOffice', 'name _id')
      .populate('sourceCurrency', 'name _id')
      .populate('targetCurrency', 'name _id')
      .exec();
  }

  async findOne(id: string): Promise<Transaction> {
    return this.transactionModel.findById(id).exec();
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
}
