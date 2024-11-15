/* eslint-disable */
import {
  BadRequestException,
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

interface DailyTotals {
  total_income: number;
  total_expenses: number;
  check_income: number; // Nuevo campo para seguimiento de cheques
}

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

  private truncateDate(date: Date | string): Date {
    const parseDate = new Date(date);
    return new Date(
      parseDate.getUTCFullYear(),
      parseDate.getUTCMonth(),
      parseDate.getUTCDate(),
      0,
      0,
      0,
      0,
    );
  }

  private getNextDay(date: Date): Date {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
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

      let registerDate: Date;
      if (!createCashRegisterDto.date) {
        registerDate = this.truncateDate(new Date());
      } else {
        try {
          registerDate = this.truncateDate(createCashRegisterDto.date);
        } catch (error) {
          throw new BadRequestException(
            'Formato de fecha inválido. Use YYYY-MM-DD',
          );
        }
      }

      const opening_balance = await this.calculateOpeningBalance(
        createCashRegisterDto.sub_office,
      );
      console.log(createCashRegisterDto.date, registerDate);

      const cashRegister = new this.cashRegisterModel({
        ...createCashRegisterDto,
        date: registerDate,
        opening_balance,
        closing_balance: null,
        total_income: 0,
        total_expenses: 0,
        check_income: 0,
        difference: 0,
      });

      return await cashRegister.save();
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al iniciar el día: ${error.message}`,
      );
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

  async closeDay(id: string | Types.ObjectId): Promise<CashRegister> {
    const session = await this.cashRegisterModel.db.startSession();

    try {
      return await session.withTransaction(async () => {
        const cashRegisterId =
          id instanceof Types.ObjectId ? id : new Types.ObjectId(id);

        // Verificar si la caja existe y está abierta
        const existingRegister = await this.cashRegisterModel
          .findById(cashRegisterId)
          .session(session);

        if (!existingRegister) {
          throw new NotFoundException(`La caja diaria con ID ${id} no existe`);
        }

        if (existingRegister.closing_balance !== null) {
          throw new ConflictException('Esta caja ya está cerrada');
        }

        // Calcular el cierre de caja a partir del saldo de apertura
        const closingBalance = await this.calculateOpeningBalance(
          existingRegister.sub_office,
        );
        const difference = closingBalance - existingRegister.opening_balance;

        // Actualizar la caja con los nuevos valores
        const updatedRegister = await this.cashRegisterModel.findByIdAndUpdate(
          cashRegisterId,
          {
            $set: {
              closing_balance: Number(closingBalance.toFixed(2)),
              total_income: 0,
              total_expenses: 0,
              check_income: 0,
              difference: Number(difference.toFixed(2)),
            },
          },
          { new: true, runValidators: true, session },
        );

        if (!updatedRegister) {
          throw new NotFoundException('No se pudo actualizar la caja');
        }

        return updatedRegister;
      });
    } catch (error) {
      throw new BadRequestException(
        `Error al cerrar la caja: ${error.message}`,
      );
    } finally {
      await session.endSession();
    }
  }

  async updateCashRegister(
    subOfficeId: Types.ObjectId | string,
    amount: number,
    session: any,
  ): Promise<void> {
    const today = this.truncateDate(new Date());
    const tomorrow = this.getNextDay(today);
    console.log(typeof subOfficeId);
    const sub_office_id =
      subOfficeId instanceof Types.ObjectId
        ? subOfficeId
        : new Types.ObjectId(subOfficeId);

    const cashRegister = await this.cashRegisterModel
      .findOne({
        sub_office: subOfficeId,
        date: {
          $gte: this.truncateDate(today).toISOString(),
          $lt: this.truncateDate(tomorrow).toISOString(),
        },
      })
      .session(session);

    if (!cashRegister) {
      throw new BadRequestException('No hay caja abierta para el día de hoy');
    }

    if (cashRegister.closing_balance !== null) {
      throw new ConflictException('La caja ya está cerrada');
    }
  }

  async getCurrentCashRegisterForSubOffice(
    subOfficeId: string | Types.ObjectId,
  ): Promise<CashRegisterDocument | null> {
    const today = this.truncateDate(new Date());
    const tomorrow = this.getNextDay(today);

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
  async getCashRegisterByDate(dateStr: string): Promise<CashRegister> {
    try {
      const date = this.truncateDate(dateStr);
      const nextDay = this.getNextDay(date);

      return this.cashRegisterModel.findOne({
        date: {
          $gte: date,
          $lt: nextDay,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Formato de fecha inválido. Use YYYY-MM-DD',
      );
    }
  }

  async listAllCashRegisters(): Promise<CashRegister[]> {
    return this.cashRegisterModel.find();
  }

  // Método para desarrollo, usar con precaución
  async deleteAllForDevelopment(): Promise<any> {
    return this.cashRegisterModel.deleteMany();
  }

  async isCashRegisterOpen(subOfficeId: string): Promise<boolean> {
    const today = this.truncateDate(new Date());
    const tomorrow = this.getNextDay(today);

    try {
      const cashRegister = await this.cashRegisterModel.findOne({
        sub_office: subOfficeId,
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      return cashRegister !== null && cashRegister.closing_balance === null;
    } catch (error) {
      throw new BadRequestException(
        `Error al verificar si la caja está abierta: ${error.message}`,
      );
    }
  }
}

/* 
---------------------------------------------------------
ESTE METODO SE MUDA A TRANSACTION Y MUTARA EN CONVENIENCIA.
-----------------------------------------------------------


 private calculateDailyTotals(
    transactions: any[],
    exchangeRatesArray: any[],
  ): DailyTotals {
    // Convertir el array de tasas de cambio a un objeto para fácil acceso
    const exchangeRates = exchangeRatesArray.reduce((acc, curr) => {
      acc[curr.code] = curr.exchangeRate;
      return acc;
    }, {});

    console.log('Exchange rates mapped:', exchangeRates);

    // Inicializar acumuladores con 0
    const totals: DailyTotals = {
      total_income: 0,
      total_expenses: 0,
      check_income: 0,
    };

    // Validar que haya transacciones
    if (!transactions || transactions.length === 0) {
      return totals;
    }

    return transactions.reduce((acc: DailyTotals, transaction) => {
      // Validar que los valores numéricos existan y sean números
      const sourceAmount = Number(transaction.sourceAmount) || 0;
      const targetAmount = Number(transaction.targetAmount) || 0;
      const sourceCurrency = transaction.sourceCurrencyCode;
      const targetCurrency = transaction.targetCurrencyCode;
      const transactionExchangeRate = transaction.exchangeRate;

      console.log(`Processing transaction:
          Source amount: ${sourceAmount},
          Source currency: ${sourceCurrency},
          Target amount: ${targetAmount},
          Target currency: ${targetCurrency},
          Exchange rates available: ${JSON.stringify(exchangeRates)}`);

      // Validar que las tasas de cambio existan para todas las monedas necesarias
      const requiredCurrencies = [sourceCurrency, targetCurrency, 'ARS', 'USD'];
      const missingRates = requiredCurrencies.filter(
        (currency) => !exchangeRates[currency],
      );

      if (missingRates.length > 0) {
        console.warn(`Missing exchange rates for: ${missingRates.join(', ')}`);
        return acc;
      }

      // Usar la tasa de cambio de la transacción si está disponible
      const sourceRate =
        transactionExchangeRate || exchangeRates[sourceCurrency];
      const targetRate = exchangeRates[targetCurrency];

      if (!sourceRate || !targetRate) {
        console.warn(
          `Missing exchange rates for: ${sourceCurrency}, ${targetCurrency}`,
        );
        return acc;
      }

      // Convertir montos usando las tasas de cambio específicas
      const sourceAmountInARS = sourceAmount * sourceRate;
      const targetAmountInARS = targetAmount * targetRate;

      // Convertir de ARS a USD usando la tasa de cambio global de USD
      const usdRate = exchangeRates['USD'];
      const sourceAmountInUSD = sourceAmountInARS / usdRate;
      const targetAmountInUSD = targetAmountInARS / usdRate;

      switch (transaction.type) {
        case 'buy':
          acc.total_expenses += sourceAmountInUSD;
          acc.total_income += targetAmountInUSD;
          break;
        case 'sell':
          acc.total_income += sourceAmountInUSD;
          acc.total_expenses += targetAmountInUSD;
          break;
        case 'check':
          acc.check_income += targetAmountInUSD;
          break;
      }

      // Asegurar que todos los totales sean números válidos
      acc.total_income = Number(acc.total_income) || 0;
      acc.total_expenses = Number(acc.total_expenses) || 0;
      acc.check_income = Number(acc.check_income) || 0;

      return acc;
    }, totals);
  }
 */
