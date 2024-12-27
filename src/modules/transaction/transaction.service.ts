/* eslint-disable */
/**
 * Servicio para la gestión de transacciones
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar transacciones
 *
  
 * @version 1.0.0
 */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from 'src/schemas/transaction.schema';
import { SubOfficeService } from '../sub_office/sub_office.service';
import { CurrencyService } from '../currency/currency.service';
import { CashRegisterService } from '../cash_register/cash_register.service';
import { CreateTransactionDto } from 'src/dtos/create-transaction.dto';
import { UsersService } from '../users/users.service';
import { Connection } from 'mongoose';

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
    @InjectConnection() private connection: Connection,
  ) {}

  /**
   * Crea una nueva transacción
   *
   * Tipos de operaciones:
   * 'Compra':
   * - sourceCurrency: la moneda que el cliente entrega
   * - targetCurrency: la moneda que el cliente recibe
   * - amount: la cantidad de la moneda que el cliente quiere recibir
   *
   * 'Venta':
   * - sourceCurrency: la moneda que el cliente entrega
   * - targetCurrency: la moneda que el cliente recibe
   * - amount: la cantidad de la moneda que el cliente entrega
   *
   * 'Cambio de cheque':
   * - sourceCurrency: siempre será CHECK
   * - targetCurrency: siempre será ARS
   * - amount: el valor nominal del cheque
   * - exchangeRate: porcentaje que se retiene como comisión (ej: 0.95 para 5% de comisión)
   *
   * @param createTransactionDto Datos de la transacción a crear
   * @returns La transacción creada
   */
  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const {
          user,
          subOffice,
          sourceCurrency,
          targetCurrency,
          type,
          amount,
          exchangeRate,
          checkNumber,
          checkDueDate = typeof createTransactionDto.checkDueDate === 'string'
            ? new Date(createTransactionDto.checkDueDate)
            : createTransactionDto.checkDueDate,
          bankName,
        } = createTransactionDto;
        let profit: number = null;

        // Validaciones específicas por tipo de operación
        if (type === 'Cambio de cheque') {
          if (!checkNumber || !checkDueDate || !bankName) {
            throw new BadRequestException(
              'Las operaciones de cheques deben tener el campo checkNumber, checkDueDate y bankName',
            );
          }

          const arsId = (await this.currencyService.findByCode('ARS'))._id;
          if (sourceCurrency.toString() !== arsId.toString()) {
            throw new BadRequestException(
              'Las operaciones de cheque solo aceptan ARS como moneda fuente',
            );
          }
        } else {
          if (sourceCurrency.toString() === targetCurrency.toString()) {
            throw new BadRequestException(
              'Las monedas de la transacción no pueden ser iguales',
            );
          }
        }
        const currentCashRegister =
          await this.cashService.getCurrentCashRegisterForSubOffice(subOffice);
        if (!currentCashRegister) {
          throw new BadRequestException(
            'No hay caja abierta para esta sucursal. Debe abrir la caja antes de realizar operaciones.',
          );
        }

        if (currentCashRegister.closing_balance !== null) {
          throw new BadRequestException(
            'La caja del día ya está cerrada. No se pueden realizar más operaciones.',
          );
        }

        const [
          userData,
          subOfficeData,
          sourceCurrencyData,
          targetCurrencyData,
        ] = await Promise.all([
          this.userService.findOneById(user.toString()),
          this.subOfficeService.findOne(subOffice.toString()),
          this.currencyService.findOne(sourceCurrency.toString()),
          this.currencyService.findOne(targetCurrency.toString()),
        ]);

        let sourceAmount: number;
        let targetAmount: number;

        if (
          sourceCurrencyData.isPrimaryCurrency &&
          (type === 'Compra' || type === 'Cambio de cheque')
        ) {
          // el cliente compra moneda con pago en ARS(incluye cambio de cheques)
          targetAmount = amount; //cantidad que desea el cliente recibir
          sourceAmount = amount * exchangeRate; // cantidad que entrega el cliente
        } else if (targetCurrencyData.isPrimaryCurrency && type === 'Venta') {
          // el cliente vende moneda y se paga en ARS
          sourceAmount = amount; //cantidad que entrega el cliente
          targetAmount = amount * exchangeRate; // cantidad que desea el cliente recibir
        } else if (type === 'Cambio de cheque' || type === 'Compra') {
          // el cliente compra moneda con pago en moneda fuente
          sourceAmount = amount * exchangeRate; //cantidad que entrega el cliente (el vendedor debe calcular la tasa de cambio entre monedas NO ARS)
          targetAmount = amount; // cantidad que desea el cliente recibir
        } else {
          // el cliente vende moneda y se paga en moneda fuente
          targetAmount = amount; // cantidad que entrega el cliente
          sourceAmount = amount * exchangeRate; //cantidad que desea el cliente recibir (el vendedor debe calcular la tasa de cambio entre monedas NO ARS)
        }

        profit = this.calculateProfit(
          sourceCurrencyData,
          sourceAmount,
          targetCurrencyData,
          targetAmount,
          type,
        );

        if (type !== 'Cambio de cheque') {
          const currentSourceStock = Number(
            await this.subOfficeService.getCurrencyStock(
              subOffice.toString(),
              type === 'Compra'
                ? targetCurrency.toString()
                : sourceCurrency.toString(),
            ),
          );
          console.log('currentSourceStock: ', currentSourceStock);
          console.log('targetAmount: ', targetAmount);
          console.log('sourceAmount: ', sourceAmount);

          const requiredStock =
            type === 'Compra' ? Number(targetAmount) : Number(sourceAmount);

          /* console.log(
            'currentSourceStock',
            typeof currentSourceStock,
            currentSourceStock,
          );
          console.log('requiredStock', typeof requiredStock, requiredStock); */

          if (currentSourceStock < requiredStock) {
            throw new BadRequestException(
              `Stock insuficiente para ${type === 'Compra' ? targetCurrencyData.code : sourceCurrencyData.code}. ` +
                `Requerido: ${requiredStock}, Disponible: ${currentSourceStock}`,
            );
          }
        }

        // Pasar la sesión a las operaciones de stock
        if (type === 'Cambio de cheque') {
          await this.subOfficeService.updateCurrencyStock(
            subOffice.toString(),
            sourceCurrency.toString(),
            sourceAmount,
            'increase',
            session,
          );
          await this.subOfficeService.updateCurrencyStock(
            subOffice.toString(),
            targetCurrency.toString(),
            targetAmount,
            'decrease',
            session,
          );
        } else {
          await this.updateStocks(
            createTransactionDto,
            sourceAmount,
            targetAmount,
            type,
            session,
          );
        }

        const transaction = new this.transactionModel({
          ...createTransactionDto,
          userName: userData.username,
          subOfficeName: subOfficeData.name,
          sourceCurrencyCode: sourceCurrencyData.code,
          targetCurrencyCode: targetCurrencyData.code,
          sourceAmount,
          targetAmount,
          profitARS: profit,
          cashRegisterExchangeRate: currentCashRegister.rates.usd,
          totalInUsd: this.getTransactionUsdTotal(
            targetAmount,
            sourceAmount,
            type,
            exchangeRate,
          ),
          ...(type === 'Cambio de cheque' && {
            checkNumber,
            checkDueDate,
            bankName,
            checkCommission: (1 - exchangeRate) * 100,
          }),
        });

        await transaction.save({ session });
      });

      return await this.transactionModel
        .findOne({
          user: createTransactionDto.user,
          createdAt: { $gte: new Date(Date.now() - 1000) },
        })
        .exec();
    } catch (error) {
      throw new BadRequestException(
        `Error creating transaction: ${error.message}`,
      );
    } finally {
      await session.endSession();
    }
  }

  /**
   * Actualiza los stocks de las monedas según el tipo de transacción
   *
   * Comportamiento por tipo:
   * - SELL (cliente vende USD):
   *   → sourceCurrency (USD) aumenta (recibimos)
   *   → targetCurrency (ARS) disminuye (entregamos)
   *
   * - BUY (cliente compra USD):
   *   → sourceCurrency (ARS) aumenta (recibimos)
   *   → targetCurrency (USD) disminuye (entregamos)
   *
   * - CHECK:
   *   → solo targetCurrency (ARS) aumenta (recibimos el cheque)
   *
   * @param subOfficeId Identificador de la sucursal
   * @param sourceCurrencyId Identificador de la moneda fuente
   * @param targetCurrencyId Identificador de la moneda destino
   * @param sourceAmount Monto de la moneda fuente
   * @param targetAmount Monto de la moneda destino
   * @param type Tipo de transacción (buy, sell o check)
   */
  private async updateStocks(
    transaction: Partial<CreateTransactionDto>,
    sourceAmount: number,
    targetAmount: number,
    type: string,
    session: any,
  ): Promise<void> {
    if (isNaN(sourceAmount) || isNaN(targetAmount)) {
      throw new BadRequestException('Invalid amount: NaN');
    }
    // En ambas operaciones:
    // - La moneda que recibimos aumenta
    // - La moneda que entregamos disminuye
    if (type === 'Venta') {
      // En SELL:
      // - Recibimos la sourceCurrency (USD)
      // - Entregamos la targetCurrency (ARS)
      await Promise.all([
        this.subOfficeService.updateCurrencyStock(
          transaction.subOffice,
          transaction.sourceCurrency,
          sourceAmount,
          'increase', // Recibimos USD
          session,
        ),
        this.subOfficeService.updateCurrencyStock(
          transaction.subOffice,
          transaction.targetCurrency,
          targetAmount,
          'decrease', // Entregamos ARS
          session,
        ),
      ]);
    } else if (type === 'Compra' || type === 'Cambio de cheque') {
      // En BUY:
      // - Recibimos la sourceCurrency (ARS)
      // - Entregamos la targetCurrency (USD)
      await Promise.all([
        this.subOfficeService.updateCurrencyStock(
          transaction.subOffice,
          transaction.sourceCurrency,
          sourceAmount,
          'increase', // Recibimos ARS
          session,
        ),
        this.subOfficeService.updateCurrencyStock(
          transaction.subOffice,
          transaction.targetCurrency,
          targetAmount,
          'decrease', // Entregamos USD
          session,
        ),
      ]);
    }
  }

  private calculateProfit(
    sourceCurrencyData: { exchangeRate: number; isPrimaryCurrency: boolean },
    sourceAmount: number,
    targetCurrencyData: { exchangeRate: number; isPrimaryCurrency: boolean },
    targetAmount: number,
    type: string,
  ) {
    let profit = 0;
    if (type === 'Compra' || type === 'Cambio de cheque') {
      if (sourceCurrencyData.isPrimaryCurrency) {
        // Si la moneda fuente es primaria, calculamos la ganancia
        const innerExchangeRate = targetCurrencyData.exchangeRate;
        profit = sourceAmount - innerExchangeRate * targetAmount;
      } else {
        // Si la moneda fuente no es primaria, convertimos a ARS
        let convertedAmount = sourceAmount * sourceCurrencyData.exchangeRate;
        profit =
          convertedAmount - targetAmount * targetCurrencyData.exchangeRate;
      }
    } else if (type === 'Venta') {
      if (targetCurrencyData.isPrimaryCurrency) {
        // Si la moneda objetivo es primaria, calculamos la ganancia
        let innerExchangeRate = sourceCurrencyData.exchangeRate;
        profit = innerExchangeRate * sourceAmount - targetAmount;
      } else {
        // Si la moneda objetivo no es primaria, calculamos la conversión
        const convertedAmount = sourceAmount * sourceCurrencyData.exchangeRate;
        profit =
          convertedAmount - targetAmount * targetCurrencyData.exchangeRate;
      }
    }
    return profit;
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
  async findOne(id: string | Types.ObjectId): Promise<Transaction> {
    console.log('service findOne id', id);
    console.log('service findOne', typeof id);

    const transactionId =
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    console.log('service findOne transactionId', transactionId);

    const transactions = await this.transactionModel
      .find({ _id: id })
      .populate({
        path: 'sourceCurrency',
      })
      .populate({
        path: 'targetCurrency',
      })
      .populate({
        path: 'subOffice',
      })
      .populate({
        path: 'user',
      })
      .exec();
    const transaction = transactions[0];
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  /**
   * Actualiza una transacción
   *
   * @param id Identificador de la transacción
   * @param transactionData Datos de la transacción a actualizar
   * @returns La transacción actualizada
   */
  async update(
    id: string | Types.ObjectId,
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    const transactionId =
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    return this.transactionModel
      .findByIdAndUpdate(transactionId, transactionData, { new: true })
      .exec();
  }

  /**
   * Elimina una transacción
   *
   * @param id Identificador de la transacción
   * @returns La transacción eliminada
   */
  async delete(id: string | Types.ObjectId): Promise<String> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const transactionId =
        id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
      const transaction = await this.transactionModel
        .findById(transactionId)
        .session(session)
        .exec();

      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }
      const stockUpdateDto: Partial<CreateTransactionDto> = {
        user: transaction.user,
        subOffice: transaction.subOffice,
        sourceCurrency: transaction.targetCurrency,
        targetCurrency: transaction.sourceCurrency,
        amount:
          transaction.type === 'Venta'
            ? transaction.sourceAmount
            : transaction.targetAmount,
        type: transaction.type === 'Venta' ? 'Compra' : 'Venta',
        exchangeRate: transaction.exchangeRate,
      };
      const currentCashRegister =
        await this.cashService.getCurrentCashRegisterForSubOffice(
          transaction.subOffice,
        );
      if (currentCashRegister && currentCashRegister.closing_balance === null) {
        const transactionDate = new Date(transaction.createdAt).getTime();
        const currentDay = new Date(currentCashRegister.date).setHours(
          0,
          0,
          0,
          0,
        );
        if (transactionDate < currentDay) {
          console.warn(
            `La transacción con ID ${id} pertenece a un día anterior al de la caja abierta, no se actualizará el stock`,
          );
        } else {
          // Llama a tu método de actualización de stock
          await this.updateStocks(
            stockUpdateDto,
            transaction.targetAmount,
            transaction.sourceAmount,
            transaction.type === 'Venta' ? 'Compra' : 'Venta',
            session,
          );
          console.log(
            `Stock actualizado correctamente para la transacción con ID ${id}`,
          );
        }
      } else {
        console.warn(
          `La transacción con ID ${id} pertenece a un dia anterior al de la caja abierta, no se actualizará el stock`,
        );
      }

      // Elimina la transacción
      await this.transactionModel
        .deleteOne({ _id: transactionId })
        .session(session);
      await session.commitTransaction();
      return 'Transacción eliminada correctamente';
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
  private async getUserData(userId: string | Types.ObjectId) {
    const newUserId =
      userId instanceof Types.ObjectId ? userId : new Types.ObjectId(userId);

    try {
      const user = await this.userService.findOneById(newUserId);
      return { name: user.username };
    } catch (error) {
      return { name: 'Usuario no disponible' };
    }
  }

  private async getSubOfficeData(subOfficeId: string | Types.ObjectId) {
    const id =
      subOfficeId instanceof Types.ObjectId
        ? subOfficeId
        : new Types.ObjectId(subOfficeId);
    try {
      const subOffice = await this.subOfficeService.findOne(id);
      return { name: subOffice.name };
    } catch (error) {
      return { name: 'Sucursal no disponible' };
    }
  }

  private async getCurrencyData(currencyId: string | Types.ObjectId) {
    const id =
      currencyId instanceof Types.ObjectId
        ? currencyId
        : new Types.ObjectId(currencyId);
    try {
      const currency = await this.currencyService.findOne(id);
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
  ): Promise<any> {
    const [userData, subOfficeData, sourceCurrencyData, targetCurrencyData] =
      await Promise.all([
        this.getUserData(transaction.user.toString()),
        this.getSubOfficeData(transaction.subOffice.toString()),
        this.getCurrencyData(transaction.sourceCurrency.toString()),
        this.getCurrencyData(transaction.targetCurrency.toString()),
      ]);
    console.log('user data: ', userData);

    return {
      ...transaction.toObject(),
      userName: userData.name,
      subOfficeName: subOfficeData.name,
      sourceCurrencyCode: sourceCurrencyData.code,
      sourceCurrency: sourceCurrencyData,
      targetCurrencyCode: targetCurrencyData.code,
      targetCurrency: targetCurrencyData,
    };
  }
  async getTransactionsForDay(
    subOfficeId: string | Types.ObjectId,
    date: Date,
  ): Promise<Transaction[]> {
    // Convertir la cadena a objeto Date
    const parsedDate = new Date(date);

    // Verificar si la conversión fue exitosa
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Fecha no válida');
    }

    const startOfDay = new Date(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate(),
      0,
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate(),
      23,
      59,
      59,
      999,
    );
    if (!Types.ObjectId.isValid(subOfficeId)) {
      throw new BadRequestException('El ID de la sub-oficina no es válido');
    }

    if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Fecha no válida');
    }
    const quest = await this.transactionModel
      .find({
        subOffice: subOfficeId.toString(),
      })
      .lean()
      .exec();
    console.log('startOfDay', startOfDay, 'endOfDay', endOfDay);

    try {
      return await this.transactionModel
        .find({
          subOffice: subOfficeId,
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        })
        .lean()
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las transacciones',
      );
    }
  }
  async getTransactionsForMonth(
    subOfficeId: string | Types.ObjectId,
    date: Date,
  ): Promise<Transaction[]> {
    // Convertir la cadena a objeto Date
    const parsedDate = new Date(date);

    // Verificar si la conversión fue exitosa
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Fecha no válida');
    }

    if (!Types.ObjectId.isValid(subOfficeId)) {
      throw new BadRequestException('El ID de la sub-oficina no es válido');
    }

    const startOfMonth = new Date(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate() | 1,
    );
    const endOfMonth = new Date(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth() + 1,
      parsedDate.getUTCDate() | 0,
      23,
      59,
      59,
      999,
    );
    console.log('startOfMonth', startOfMonth, 'endOfMonth', endOfMonth);

    try {
      return await this.transactionModel
        .find({
          subOffice: subOfficeId,
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        })
        .lean()
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las transacciones',
      );
    }
  }

  async getTransactionsForDateRange(
    subOfficeId: string | Types.ObjectId,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<Transaction[]> {
    if (!Types.ObjectId.isValid(subOfficeId)) {
      throw new BadRequestException('El ID de la sub-oficina no es válido');
    }
    try {
      return await this.transactionModel
        .find({
          subOffice: subOfficeId,
          createdAt: {
            $gte: dateFrom,
            $lte: dateTo,
          },
        })
        .lean()
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las transacciones',
      );
    }
  }

  async getSalesAndChecksForDay(
    subOfficeId: string | Types.ObjectId,
    date: Date,
  ): Promise<Transaction[]> {
    const transactions = await this.getTransactionsForDay(subOfficeId, date);
    return transactions.filter(
      (transaction) =>
        transaction.type === 'Compra' ||
        transaction.type === 'Cambio de cheque',
    );
  }

  async getPurchasesForDay(
    subOfficeId: string | Types.ObjectId,
    date: Date,
  ): Promise<Transaction[]> {
    const transactions = await this.getTransactionsForDay(subOfficeId, date);
    return transactions.filter((transaction) => transaction.type === 'Venta');
  }

  // Método para desarrollo, usar con precaución
  async deleteAllForDevelopment(): Promise<any> {
    const transactions = await this.transactionModel.find().exec();
    console.log(transactions);

    return this.transactionModel.deleteMany({});
  }

  getTransactionUsdTotal(
    targetAmount: number,
    sourceAmount: number,
    type: string,
    exchangeRate: number,
  ): number {
    const usdTotal =
      type === 'Compra'
        ? sourceAmount / exchangeRate
        : targetAmount / exchangeRate;
    return parseFloat(usdTotal.toFixed(2));
  }

  getTransactionsFiltered(subOfficeId: string | Types.ObjectId, filter: any) {
    try {
      if (!filter.pagoDoble) {
        const transactions = this.transactionModel
          .find({ subOffice: subOfficeId, ...filter })
          .lean()
          .exec();

        return transactions;
      } else if (filter.pagoDoble) {
        const transactions = this.transactionModel
          .find({
            subOffice: subOfficeId,
            $and: [
              { 'paymentMethods.method': 'Efectivo' },
              { 'paymentMethods.method': 'Transferencia' },
            ],
          })
          .lean()
          .exec();
        console.log(filter);

        return transactions;
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las transacciones',
      );
    }
  }
  /*  --------------------------Migracion dev para campos nuevos(relativos a metodo de pago)
  async migrateTransactions() {
    const defaultValues = {
      accountOrigin: '',
      accountDestination: '',
      bankOrigin: '',
      bankDestination: '',
      sender: '',
      proofNumber: '',
      paymentMethod: 'Efectivo',
    };

    const result = await this.transactionModel.updateMany(
      { paymentMethod: { $exists: false } },
      { $set: defaultValues },
    );

    return {
      message: `Actualizados ${result.modifiedCount} documentos`,
      result,
    };
  } */
}
