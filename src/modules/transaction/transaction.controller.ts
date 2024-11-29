/* eslint-disable */
/**
 * Controlador para la gestión de transacciones
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar transacciones
 *
  
 * @version 1.0.0
 * @since 2020-07-20
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';

import { Transaction } from 'src/schemas/transaction.schema';
import { CreateTransactionDto } from 'src/dtos/create-transaction.dto';
import { Types } from 'mongoose';

/**
 * Controlador para la gestión de transacciones
 */
@Controller('transactions')
export class TransactionController {
  /**
   * Constructor del controlador
   * @param transactionService Servicio para la gestión de transacciones
   */
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * Crea una nueva transacción
   * @param transactionData Datos de la transacción a crear
   * @returns La transacción creada
   */
  @Post()
  create(@Body() transactionData: CreateTransactionDto) {
    return this.transactionService.create(transactionData);
  }

  /**
   * Obtiene todas las transacciones
   * @returns Un arreglo con todas las transacciones
   */
  @Get()
  findAll() {
    return this.transactionService.findAll();
  }

  /**
   * Obtiene una transacción por ID
   * @param id ID de la transacción a obtener
   * @returns La transacción obtenida
   */
  @Get(':id')
  findOne(@Param('id') id: string | Types.ObjectId) {
    return this.transactionService.findOne(id);
  }

  /**
   * Actualiza una transacción
   * @param id ID de la transacción a actualizar
   * @param transactionData Datos de la transacción a actualizar
   * @returns La transacción actualizada
   */
  @Put(':id')
  update(
    @Param('id') id: string | Types.ObjectId,
    @Body() transactionData: Partial<Transaction>,
  ) {
    return this.transactionService.update(id, transactionData);
  }

  /**
   * Elimina una transacción
   * @param id ID de la transacción a eliminar
   * @returns La transacción eliminada
   */
  @Delete(':id')
  delete(@Param('id') id: string | Types.ObjectId) {
    return this.transactionService.delete(id);
  }

  /**
   * Elimina todas las transacciones
   * @returns Un mensaje indicando que se han eliminado todas las transacciones
   */
  @Delete()
  deleteAllForDevelopment() {
    return this.transactionService.deleteAllForDevelopment();
  }

  /**
   * Obtiene las transacciones para un día determinado en una suboficina
   * @param subOfficeId ID de la suboficina para buscar las transacciones
   * @param date Fecha para buscar las transacciones
   * @returns Un arreglo con las transacciones encontradas
   */
  @Get(':subOfficeId/forDay/:date')
  getTransactionsForDay(
    @Param('subOfficeId') subOfficeId: string | Types.ObjectId,
    @Param('date') date: Date,
  ) {
    return this.transactionService.getTransactionsForDay(subOfficeId, date);
  }
  @Get(':subOfficeId/forMonth/:date')
  getTransactionsForMonth(
    @Param('subOfficeId') subOfficeId: string | Types.ObjectId,
    @Param('date') date: Date,
  ) {
    return this.transactionService.getTransactionsForMonth(subOfficeId, date);
  }
  @Get(':subOfficeId/TotalSalesForDay/:date')
  getTotalSalesForDay(
    @Param('subOfficeId') subOfficeId: string | Types.ObjectId,
    @Param('date') date: Date,
  ) {
    try {
      return this.transactionService.getSalesAndChecksForDay(subOfficeId, date);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  @Get(':subOfficeId/totalPurchasesForDay/:date')
  getTotalPurchasesForDay(
    @Param('subOfficeId') subOfficeId: string | Types.ObjectId,
    @Param('date') date: Date,
  ) {
    try {
      return this.transactionService.getSalesAndChecksForDay(subOfficeId, date);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
