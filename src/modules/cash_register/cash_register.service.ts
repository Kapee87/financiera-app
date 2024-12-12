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
import { CloseCashRegisterDto } from 'src/dtos/close-cash-register.dto';
import {
  Transaction,
  TransactionDocument,
} from 'src/schemas/transaction.schema';
import { Movement, MovementDocument } from 'src/schemas/movement.schema';
import { SubOffice } from 'src/schemas/sub_office.schema';
import { MovementService } from '../movements/movements.service';
import { cashRegisterFilterDto } from 'src/dtos/cash-register-filter.dto';
import { truncateDate } from 'src/utils/utilFunctions/utils';

export interface CurrencyTotals {
  totalIncomeUSD: number;
  totalExpensesUSD: number;
  checkIncomeUSD: number;
}
type CombinedItem = Transaction &
  Movement & {
    createdAt?: Date;
    date?: Date;
  };

@Injectable()
export class CashRegisterService {
  constructor(
    @InjectModel(CashRegister.name)
    private cashRegisterModel: Model<CashRegisterDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(Movement.name)
    private movementModel: Model<MovementDocument>,

    @Inject(forwardRef(() => CurrencyService))
    private currencyService: CurrencyService,
    @Inject(forwardRef(() => SubOfficeService))
    private subOfficeService: SubOfficeService,
  ) {}

  private getNextDay(date: Date): Date {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  }

  // Convert amount from any currency to USD using ARS as intermediate
  private convertToUSD(
    amount: number,
    fromCurrencyRate: number,
    usdRate: number,
  ): number {
    // First convert to ARS (multiply by currency rate)
    const amountInARS = amount * fromCurrencyRate;
    // Then convert ARS to USD (divide by USD rate)
    return amountInARS / usdRate;
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
        registerDate = truncateDate(new Date());
      } else {
        try {
          registerDate = truncateDate(createCashRegisterDto.date);
        } catch (error) {
          throw new BadRequestException(
            'Formato de fecha inválido. Use YYYY-MM-DD',
          );
        }
      }

      const cashRegister = new this.cashRegisterModel({
        ...createCashRegisterDto,
        date: registerDate,
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

  async calculateTransactionTotals(
    subOfficeId: string | Types.ObjectId,
    date: Date,
    usdRate: number,
  ): Promise<CurrencyTotals> {
    const nextDay = this.getNextDay(date);
    date = truncateDate(date);

    const transactions = await this.transactionModel
      .find({
        subOffice: subOfficeId,
        createdAt: { $gte: date, $lt: nextDay },
      })
      .populate(['sourceCurrency', 'targetCurrency']);
    console.log('transactions', transactions);
    console.log('today', date);
    console.log('nextDay', nextDay);

    let totalIncomeUSD = 0;
    let totalExpensesUSD = 0;
    let checkIncomeUSD = 0;

    for (const tx of transactions) {
      const sourceCurrency = await this.currencyService.findOne(
        tx.sourceCurrency._id,
      );
      const targetCurrency = await this.currencyService.findOne(
        tx.targetCurrency._id,
      );
      // Convert source and target amounts to USD
      const sourceAmountUSD = this.convertToUSD(
        tx.sourceAmount,
        sourceCurrency.exchangeRate,
        usdRate,
      );
      const targetAmountUSD = this.convertToUSD(
        tx.targetAmount,
        targetCurrency.exchangeRate,
        usdRate,
      );

      switch (tx.type) {
        case 'Compra':
          totalExpensesUSD += sourceAmountUSD;
          totalIncomeUSD += targetAmountUSD;
          break;
        case 'Venta':
          totalIncomeUSD += sourceAmountUSD;
          totalExpensesUSD += targetAmountUSD;
          break;
        case 'Cambio de cheque':
          checkIncomeUSD += targetAmountUSD;
          break;
      }
    }

    return {
      totalIncomeUSD: Number(totalIncomeUSD.toFixed(2)),
      totalExpensesUSD: Number(totalExpensesUSD.toFixed(2)),
      checkIncomeUSD: Number(checkIncomeUSD.toFixed(2)),
    };
  }

  async calculateMovementTotals(
    subOfficeId: string | Types.ObjectId,
    date: Date,
    usdRate: number,
  ): Promise<{ incomeUSD: number; expensesUSD: number }> {
    const nextDay = this.getNextDay(date);
    date = truncateDate(date);

    const movements = await this.movementModel
      .find({
        sub_office: subOfficeId.toString(),
        date: { $gte: date, $lt: nextDay },
      })
      .populate('currency');

    let incomeUSD = 0;
    let expensesUSD = 0;

    for (const movement of movements) {
      const currency = await this.currencyService.findOne(movement.currency);
      const amountUSD = this.convertToUSD(
        movement.amount,
        currency.exchangeRate,
        usdRate,
      );

      if (movement.category === 'ingreso') {
        incomeUSD += amountUSD;
      } else {
        expensesUSD += amountUSD;
      }
    }

    return {
      incomeUSD: Number(incomeUSD.toFixed(2)),
      expensesUSD: Number(expensesUSD.toFixed(2)),
    };
  }

  async calculateCurrentStockTotal(
    subOfficeId: string | Types.ObjectId,
    usd_rate: number,
  ): Promise<number> {
    const subOffice = await this.subOfficeService.findOne(subOfficeId);

    if (!subOffice) {
      throw new NotFoundException('Sub-oficina no encontrada');
    }
    let totalStockUSD = 0;
    for (const currencyStock of subOffice.currencies) {
      const currency = await this.currencyService.findOne(
        currencyStock.currency,
      );

      // Primero convertir a ARS
      const amountInARS = currencyStock.stock * currency.exchangeRate;

      // Luego convertir de ARS a USD
      const amountInUSD = amountInARS / usd_rate;

      totalStockUSD += amountInUSD;
    }
    return Number(totalStockUSD.toFixed(2)) || 0;
  }

  async closeDay(
    id: string | Types.ObjectId,
    closeCashRegisterDto: CloseCashRegisterDto,
  ): Promise<CashRegister> {
    const session = await this.cashRegisterModel.db.startSession();

    try {
      return await session.withTransaction(async () => {
        const cashRegisterId =
          typeof id === 'string' ? new Types.ObjectId(id) : id;
        const register = await this.cashRegisterModel
          .findById(cashRegisterId)
          .session(session);

        if (!register) {
          throw new NotFoundException(
            `No se encontró un registro de caja con el ID ${id}`,
          );
        }

        if (register.closing_balance !== null) {
          throw new ConflictException(
            'Esta caja ya está cerrada. No se puede cerrar nuevamente',
          );
        }
        let newClosingBalance = 0;
        if (!closeCashRegisterDto.closing_balance) {
          try {
            newClosingBalance = Number(
              await this.calculateCurrentStockTotal(
                register.sub_office,
                closeCashRegisterDto.usd_rate,
              ),
            );
          } catch (error) {
            throw new BadRequestException(
              `Error calculando saldo de cierre: ${error.message}`,
            );
          }
        } else {
          newClosingBalance = closeCashRegisterDto.closing_balance;
        }
        let closing_balance =
          closeCashRegisterDto.closing_balance || newClosingBalance;
        const { usd_rate, ars_rate } = closeCashRegisterDto;

        // Calculate transaction totals
        const transactionTotals = await this.calculateTransactionTotals(
          register.sub_office,
          register.date,
          usd_rate,
        );

        // Calculate movement totals
        const movementTotals = await this.calculateMovementTotals(
          register.sub_office,
          register.date,
          usd_rate,
        );

        // Calculate final totals in USD
        const totalIncomeUSD =
          transactionTotals.totalIncomeUSD + movementTotals.incomeUSD;
        const totalExpensesUSD =
          transactionTotals.totalExpensesUSD + movementTotals.expensesUSD;
        const checkIncomeUSD = transactionTotals.checkIncomeUSD;

        const differenceUSD = closing_balance - register.opening_balance;
        console.log(
          closing_balance,
          totalIncomeUSD,
          totalExpensesUSD,
          checkIncomeUSD,
          differenceUSD,
        );

        const updatedRegister = await this.cashRegisterModel.findByIdAndUpdate(
          cashRegisterId,
          {
            closing_balance: Number(closing_balance.toFixed(2)),
            total_income: Number(totalIncomeUSD.toFixed(2)),
            total_expenses: Number(totalExpensesUSD.toFixed(2)),
            check_income: Number(checkIncomeUSD.toFixed(2)),
            difference: Number(differenceUSD.toFixed(2)),
            rates: { usd: usd_rate, ars: ars_rate },
          },
          { new: true, runValidators: true, session },
        );

        if (!updatedRegister) {
          throw new NotFoundException('Could not update cash register');
        }

        return updatedRegister;
      });
    } catch (error) {
      throw new BadRequestException(
        `Error closing cash register: ${error.message}`,
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
    const today = truncateDate(new Date());
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
          $gte: truncateDate(today).toISOString(),
          $lt: truncateDate(tomorrow).toISOString(),
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
    const today = truncateDate(new Date());
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
      const date = truncateDate(dateStr);
      const nextDay = this.getNextDay(date);

      return this.cashRegisterModel
        .findOne({
          date: {
            $gte: date,
            $lt: nextDay,
          },
        })
        .populate('sub_office', '_id name')
        .exec();
    } catch (error) {
      throw new BadRequestException(
        'Formato de fecha inválido. Use YYYY-MM-DD',
      );
    }
  }

  async listAllCashRegisters(): Promise<CashRegister[]> {
    return this.cashRegisterModel
      .find()
      .populate('sub_office', '_id name code')
      .exec();
  }

  async findById(id: string | Types.ObjectId): Promise<CashRegister> {
    return this.cashRegisterModel
      .findById(id)
      .populate('sub_office', '_id name')
      .exec();
  }

  // Método para desarrollo, usar con precaución
  async deleteAllForDevelopment(): Promise<any> {
    return this.cashRegisterModel.deleteMany();
  }

  async isCashRegisterOpen(subOfficeId: string): Promise<boolean> {
    const today = truncateDate(new Date());
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

  async getTransactionsAndMovementsForDay(
    subOfficeId: string | Types.ObjectId,
    cashRegisterFilterDto: cashRegisterFilterDto,
  ): Promise<any> {
    const transactions = await this.transactionModel
      .find({
        subOffice: subOfficeId,
        $or: [
          {
            sourceCurrency: cashRegisterFilterDto.currencyId || {
              $exists: true,
            },
          },
          {
            targetCurrency: cashRegisterFilterDto.currencyId || {
              $exists: true,
            },
          },
        ],
        ...(cashRegisterFilterDto.userId && {
          user: cashRegisterFilterDto.userId,
        }),
        createdAt: {
          $gte: truncateDate(new Date()).toISOString(),
          $lt: this.getNextDay(new Date()).toISOString(),
        },
      })
      .populate('user', '_id username email')
      .populate('sourceCurrency', '_id name')
      .populate('targetCurrency', '_id name')
      .lean();
    const movements = await this.movementModel
      .find({
        sub_office: subOfficeId,
        $or: [
          {
            currency: cashRegisterFilterDto.currencyId || { $exists: true },
          },
        ],
        ...(cashRegisterFilterDto.userId && {
          user: cashRegisterFilterDto.userId,
        }),
        date: {
          $gte: truncateDate(new Date()).toISOString(),
          $lt: this.getNextDay(new Date()).toISOString(),
        },
      })
      .populate('user', '_id username email')
      .populate('currency', '_id name')
      .populate('sub_office', '_id name')
      .lean();
    const combinedItems = [
      ...transactions.map((t) => ({ ...t, sortDate: t.createdAt })),
      ...movements.map((m) => ({ ...m, sortDate: m.date })),
    ];
    return combinedItems
      .sort(
        (a, b) =>
          new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime(),
      )
      .map((item) => {
        const { sortDate, ...rest } = item;
        return rest;
      });
  }
}
