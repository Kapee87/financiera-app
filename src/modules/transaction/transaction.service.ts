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
      currency,
      type,
      amount,
      exchange_rate,
      commission,
    } = createTransactionDto;

    // Validaciones (mantener las existentes)

    const subOfficeData = await this.subOfficeService.findOne(subOffice);
    const currencyData = await this.currencyService.findOne(currency);

    // Verificar stock y actualizar
    await this.updateStocks(subOffice, currency, amount, type);

    // Manejar la caja
    await this.handleCashRegister(
      subOffice,
      type,
      amount,
      exchange_rate,
      commission,
    );

    // Registrar la transacción
    const transaction = new this.transactionModel(createTransactionDto);
    return transaction.save();
  }

  private async updateStocks(
    subOfficeId: string,
    currencyId: string,
    amount: number,
    type: string,
  ): Promise<void> {
    const stockUpdateType =
      type === 'sell' || type === 'check' ? 'decrease' : 'increase';

    // Actualizar stock en la sub-oficina
    await this.subOfficeService.updateCurrencyStock(
      subOfficeId,
      currencyId,
      amount,
      stockUpdateType,
    );

    // Actualizar stock global
    await this.currencyService.updateGlobalStock(
      currencyId,
      amount,
      stockUpdateType,
    );
  }

  private async handleCashRegister(
    subOfficeId: string,
    type: string,
    amount: number,
    exchangeRate: number,
    commission?: number,
  ): Promise<void> {
    const totalAmount = amount * exchangeRate;

    if (type === 'buy') {
      await this.cashService.updateCashRegister(subOfficeId, -totalAmount, 0); // Salida de efectivo
    } else if (type === 'sell') {
      await this.cashService.updateCashRegister(subOfficeId, totalAmount, 0); // Entrada de efectivo
    } else if (type === 'check') {
      if (!commission) {
        throw new BadRequestException(
          'La comisión es obligatoria para cambio de cheques',
        );
      }
      await this.cashService.updateCashRegister(subOfficeId, 0, commission); // Registrar comisión
    }
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionModel.find().exec();
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
