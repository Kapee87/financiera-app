/* eslint-disable */
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CashRegister,
  CashRegisterDocument,
} from 'src/schemas/cash_registers.schema';
import { CreateCashRegisterDto } from 'src/dtos/create-cash-register.dto';
import { CurrencyService } from '../currency/currency.service';
import { SubOfficeService } from '../sub_office/sub_office.service';
import { TransactionService } from '../transaction/transaction.service';

@Injectable()
export class CashRegisterService {
  constructor(
    @InjectModel(CashRegister.name)
    private cashRegisterModel: Model<CashRegisterDocument>,
    private currencyService: CurrencyService,
    private subOfficeService: SubOfficeService,
    @Inject(forwardRef(() => TransactionService))
    private transactionService: TransactionService,
  ) {}

  private truncateDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  async startDay(
    createCashRegisterDto: CreateCashRegisterDto,
  ): Promise<CashRegister> {
    try {
      const existingRegister = await this.getCurrentCashRegisterForSubOffice(
        createCashRegisterDto.sub_office,
      );
      if (existingRegister) {
        throw new ConflictException(
          'Ya existe una caja abierta para esta sub-oficina hoy',
        );
      }

      if (createCashRegisterDto.date === undefined) {
        createCashRegisterDto.date = this.truncateDate(new Date());
      } else {
        createCashRegisterDto.date = this.truncateDate(
          new Date(createCashRegisterDto.date),
        );
      }

      // Calcular el opening_balance automáticamente
      const opening_balance = await this.calculateOpeningBalance(
        createCashRegisterDto.sub_office,
      );

      const cashRegister = new this.cashRegisterModel({
        ...createCashRegisterDto,
        opening_balance,
        closing_balance: null,
        total_income: 0,
        total_expenses: 0,
        difference: 0,
      });

      return await cashRegister.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException(`Error al iniciar el día: ${error.message}`);
    }
  }

  private async calculateOpeningBalance(
    subOfficeId: string | Types.ObjectId,
  ): Promise<number> {
    console.log(`Calculating opening balance for subOffice: ${subOfficeId}`);

    const currencies = await this.currencyService.findAll();
    console.log('All currencies:', JSON.stringify(currencies, null, 2));

    let totalARSValue = 0;
    const BASE_CURRENCY = 'ARS';
    const USD_CURRENCY = 'USD';

    for (const currency of currencies) {
      console.log(`Processing currency: ${currency.code}`);

      const stock = await this.subOfficeService.getCurrencyStock(
        subOfficeId,
        currency._id,
      );
      console.log(`Stock for ${currency.code}: ${stock}`);

      let arsRate;
      if (currency.code === BASE_CURRENCY) {
        arsRate = 1;
      } else {
        // Convertimos todas las monedas a ARS
        arsRate = currency.exchangeRate;
      }
      console.log(`ARS Rate for ${currency.code}: ${arsRate}`);

      const currencyValueInARS = stock * arsRate;
      console.log(`Value in ARS for ${currency.code}: ${currencyValueInARS}`);

      totalARSValue += currencyValueInARS;
      console.log(`Running total ARS Value: ${totalARSValue}`);
    }

    console.log(`Final total ARS Value: ${totalARSValue}`);

    // Convertir el total de ARS a USD
    const usdCurrency = currencies.find((c) => c.code === USD_CURRENCY);
    if (!usdCurrency) {
      throw new Error('USD currency not found');
    }
    const usdRate = usdCurrency.exchangeRate;
    const totalUSDValue = totalARSValue / usdRate;

    const truncatedUSDValue = Number(totalUSDValue.toFixed(2));
    console.log(`Final total USD Value: ${truncatedUSDValue}`);
    return truncatedUSDValue;
  }

  private async updateARSStock(
    subOfficeId: string,
    amount: number,
  ): Promise<void> {
    const arsCurrency = await this.currencyService.findByCode('ARS');
    if (!arsCurrency) {
      throw new NotFoundException('No se encontró la moneda ARS');
    }

    const truncatedAmount = Number(amount.toFixed(2));
    await this.subOfficeService.updateCurrencyStock(
      subOfficeId,
      arsCurrency._id.toString(),
      truncatedAmount,
      'set',
    );
  }

  async closeDay(id: string | Types.ObjectId): Promise<CashRegister> {
    const cashRegisterId =
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    const cashRegister = await this.cashRegisterModel.findById(cashRegisterId);
    if (!cashRegister) {
      throw new NotFoundException(`La caja diaria con ID ${id} no existe`);
    }

    // Obtener todas las transacciones del día para esta caja
    const transactions = await this.transactionService.getTransactionsForDay(
      cashRegister.sub_office,
      cashRegister.date,
    );

    // Calcular total_income y total_expenses
    let total_income = 0;
    let total_expenses = 0;
    for (const transaction of transactions) {
      if (transaction.type === 'buy') {
        total_expenses += transaction.targetAmount;
      } else if (transaction.type === 'sell') {
        total_income += transaction.sourceAmount;
      }
      // Para 'exchange', no afecta el balance de la caja en ARS
    }

    // Calcular closing_balance
    const closing_balance =
      cashRegister.opening_balance + total_income - total_expenses;

    // Actualizar la caja
    cashRegister.closing_balance = closing_balance;
    cashRegister.total_income = total_income;
    cashRegister.total_expenses = total_expenses;
    cashRegister.difference = closing_balance - cashRegister.opening_balance;

    // Actualizar el stock de ARS en la sub-oficina
    await this.updateARSStock(
      cashRegister.sub_office.toString(),
      closing_balance,
    );

    return cashRegister.save();
  }

  async updateCashRegister(
    subOfficeId: string,
    amount: number,
    session: any,
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let cashRegister = await this.cashRegisterModel
      .findOne({
        sub_office: new Types.ObjectId(subOfficeId),
        date: today,
      })
      .session(session);

    if (!cashRegister) {
      // If no cash register exists for today, create a new one
      cashRegister = new this.cashRegisterModel({
        date: today,
        opening_balance: 0,
        sub_office: new Types.ObjectId(subOfficeId),
      });
    }

    if (amount > 0) {
      cashRegister.total_income += amount;
    } else {
      cashRegister.total_expenses += Math.abs(amount);
    }

    // Update the closing balance
    cashRegister.closing_balance =
      cashRegister.opening_balance +
      cashRegister.total_income -
      cashRegister.total_expenses;

    // Calculate the difference
    cashRegister.difference =
      cashRegister.closing_balance - cashRegister.opening_balance;

    await cashRegister.save({ session });
  }

  async getCurrentCashRegisterForSubOffice(
    subOfficeId: string | Types.ObjectId,
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
