/* eslint-disable */
/**
 * Servicio para la gestión de transacciones
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar transacciones
 *
  
 * @version 1.0.0
 * @since 2020-07-20
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
   * 'buy':
   * - sourceCurrency: la moneda que el cliente entrega
   * - targetCurrency: la moneda que el cliente recibe
   * - amount: la cantidad de la moneda que el cliente quiere recibir
   *
   * 'sell':
   * - sourceCurrency: la moneda que el cliente entrega
   * - targetCurrency: la moneda que el cliente recibe
   * - amount: la cantidad de la moneda que el cliente entrega
   *
   * 'check':
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

        // Validaciones específicas por tipo de operación
        if (type === 'check') {
          if (!checkNumber || !checkDueDate || !bankName) {
            throw new BadRequestException(
              'Las operaciones de cheques deben tener el campo checkNumber, checkDueDate y bankName',
            );
          }

          const arsId = (await this.currencyService.findByCode('ARS'))._id;
          if (targetCurrency.toString() !== arsId.toString()) {
            throw new BadRequestException(
              'Las operaciones de cheque no pueden ser realizadas con moneda diferente a ARS',
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

        switch (type) {
          case 'buy':
            targetAmount = amount; //cantidad que desea el cliente recibir
            sourceAmount = amount * exchangeRate; // cantidad que entrega el cliente
            break;
          case 'sell':
            sourceAmount = amount; //cantidad que entrega el cliente
            targetAmount = amount * exchangeRate; // cantidad que desea el cliente
            break;
          case 'check':
            sourceAmount = amount; //cantidad que entrega el cliente(mediante cheque)
            targetAmount = amount * exchangeRate; // cantidad que desea el cliente
            break;
          default:
            throw new Error('Tipo de operación no soportada');
        }

        if (type !== 'check') {
          const currentSourceStock = Number(
            await this.subOfficeService.getCurrencyStock(
              subOffice.toString(),
              type === 'buy'
                ? targetCurrency.toString()
                : sourceCurrency.toString(),
            ),
          );
          console.log('currentSourceStock: ', currentSourceStock);
          console.log('targetAmount: ', targetAmount);
          console.log('sourceAmount: ', sourceAmount);

          const requiredStock =
            type === 'buy' ? Number(targetAmount) : Number(sourceAmount);

          /* console.log(
            'currentSourceStock',
            typeof currentSourceStock,
            currentSourceStock,
          );
          console.log('requiredStock', typeof requiredStock, requiredStock); */

          if (currentSourceStock < requiredStock) {
            throw new BadRequestException(
              `Stock insuficiente para ${type === 'buy' ? targetCurrencyData.code : sourceCurrencyData.code}. ` +
                `Requerido: ${requiredStock}, Disponible: ${currentSourceStock}`,
            );
          }
        }

        // Pasar la sesión a las operaciones de stock
        if (type === 'check') {
          await this.subOfficeService.updateCurrencyStock(
            subOffice.toString(),
            targetCurrency.toString(),
            targetAmount,
            'increase',
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
          ...(type === 'check' && {
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
    transaction: CreateTransactionDto,
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
    if (type === 'sell') {
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
    } else if (type === 'buy') {
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
    subOfficeId: Types.ObjectId,
    type: string,
    sourceAmount: number,
    targetAmount: number,
    session: any,
  ): Promise<void> {
    let cashChange = 0;

    if (type === 'buy') {
      cashChange = -sourceAmount;
    } else if (type === 'sell') {
      cashChange = sourceAmount;
    }

    try {
      await this.cashService.updateCashRegister(
        subOfficeId,
        cashChange,
        session,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
    const transactionId =
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    const transaction = await this.transactionModel
      .findById(transactionId)
      .exec();
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
  async delete(id: string | Types.ObjectId): Promise<Transaction> {
    const transactionId =
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    return this.transactionModel.findByIdAndDelete(transactionId).exec();
  }
  private async getUserData(userId: string | Types.ObjectId) {
    const newUserId =
      userId instanceof Types.ObjectId ? userId : new Types.ObjectId();
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
    if (!Types.ObjectId.isValid(subOfficeId)) {
      throw new BadRequestException('El ID de la sub-oficina no es válido');
    }
    const startOfMonth = new Date(date.getUTCFullYear(), date.getUTCMonth(), 1);
    const endOfMonth = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
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

  async getSalesAndChecksForDay(
    subOfficeId: string | Types.ObjectId,
    date: Date,
  ): Promise<Transaction[]> {
    const transactions = await this.getTransactionsForDay(subOfficeId, date);
    return transactions.filter(
      (transaction) =>
        transaction.type === 'sell' || transaction.type === 'check',
    );
  }

  async getPurchasesForDay(
    subOfficeId: string | Types.ObjectId,
    date: Date,
  ): Promise<Transaction[]> {
    const transactions = await this.getTransactionsForDay(subOfficeId, date);
    return transactions.filter((transaction) => transaction.type === 'buy');
  }

  // Método para desarrollo, usar con precaución
  async deleteAllForDevelopment(): Promise<any> {
    const transactions = await this.transactionModel.find().exec();
    console.log(transactions);

    return this.transactionModel.deleteMany({});
  }
}
