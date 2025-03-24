/* eslint-disable */
/**
 * Controlador para la gestión de suboficinas
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar suboficinas
 *
  Carlos Páez
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SubOfficeService } from './sub_office.service';

import { Error, Types } from 'mongoose';
import { createSubOfficeDto } from 'src/dtos/create-subOffice.dto';
import { updateSubOfficeDto } from 'src/dtos/update-subOffice.dto';
import { SubOffice } from 'src/schemas/sub_office.schema';
import { UpdateCurrenciesStockDto } from 'src/dtos/update-currencies-stock.dto';

@Controller('sub_offices')
export class SubOfficeController {
  /**
   * Servicio para la gestión de suboficinas
   *
   * @private
   */
  constructor(private readonly subOfficeService: SubOfficeService) {}

  //Traer oficinias por nomrbe y id
  @Get('/get/name-ids')
  async getOfficesNames() {
    return await this.subOfficeService.getOfficesNames();
  }

  /**
   * Crea una nueva suboficina
   *
   * @param {Partial<createSubOfficeDto>} subOfficeData - Información de la suboficina a crear
   * @returns {Promise<SubOffice>} - Promesa que se resuelve con la suboficina creada
   */
  @Post()
  create(
    @Body() subOfficeData: Partial<createSubOfficeDto>,
  ): Promise<SubOffice> {
    try {
      return this.subOfficeService.create(subOfficeData);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Obtiene todas las suboficinas
   *
   * @returns {Promise<SubOffice[]>} - Promesa que se resuelve con todas las suboficinas
   */
  @Get()
  findAll(): Promise<SubOffice[]> {
    return this.subOfficeService.findAll();
  }

  /**
   * Obtiene una suboficina por su ID
   *
   * @param {string} id - ID de la suboficina a obtener
   * @returns {Promise<SubOffice>} - Promesa que se resuelve con la suboficina obtenida
   */
  @Get(':id')
  findOne(@Param('id') id: string | Types.ObjectId): Promise<SubOffice> {
    return this.subOfficeService.findOne(id);
  }

  /**
   * Obtiene una suboficina por su número de identificación
   *
   * @param {string} numeroIdentificacion - Número de identificación de la suboficina a obtener
   * @returns {Promise<SubOffice>} - Promesa que se resuelve con la suboficina obtenida
   */
  @Get('numero-identificacion/:numeroIdentificacion')
  findOneByNumberIdentification(
    @Param('numeroIdentificacion') numeroIdentificacion: string,
  ): Promise<SubOffice> {
    return this.subOfficeService.findOneByNumberIdentification(
      numeroIdentificacion,
    );
  }

  /**
   * Actualiza una suboficina
   *
   * @param {string} id - ID de la suboficina a actualizar
   * @param {Partial<updateSubOfficeDto>} officeData - Información de la suboficina a actualizar
   * @returns {Promise<SubOffice>} - Promesa que se resuelve con la suboficina actualizada
   */
  @Put(':id')
  update(
    @Param('id') id: string | Types.ObjectId,
    @Body() officeData: Partial<updateSubOfficeDto>,
  ): Promise<SubOffice> {
    return this.subOfficeService.update(id, officeData);
  }

  /**
   * Actualiza el stock de una moneda en una suboficina
   *
   * @param {string} subOfficeId - ID de la suboficina a actualizar
   * @param {string} currencyId - ID de la moneda a actualizar
   * @param {number} amount - Cantidad a agregar o restar al stock
   * @param {string} operation - 'increase' o 'decrease'
   * @returns {Promise<void>} No devuelve nada
   */
  @Put(':subOfficeId/currencies/:currencyId')
  async updateCurrencyStock(
    @Param('subOfficeId') subOfficeId: string | Types.ObjectId,
    @Param('currencyId') currencyId: string | Types.ObjectId,
    @Body()
    {
      amount,
      operation,
    }: { amount: number; operation: 'increase' | 'decrease' },
  ): Promise<string> {
    return this.subOfficeService.updateCurrencyStock(
      subOfficeId,
      currencyId,
      amount,
      operation,
    );
  }
  /**
   * Actualiza el stock de múltiples monedas en una suboficina
   *
   * @param {string} subOfficeId - ID de la suboficina a actualizar
   * @param {UpdateCurrenciesStockDto} updateData - Datos de las monedas a actualizar
   * @returns {Promise<string>} Un mensaje de confirmación
   */
  @Put(':subOfficeId/currencies')
  async updateMultipleCurrencyStocks(
    @Param('subOfficeId') subOfficeId: string | Types.ObjectId,
    @Body() updateData: UpdateCurrenciesStockDto,
  ): Promise<string> {
    return this.subOfficeService.updateMultipleCurrencyStocks(
      subOfficeId,
      updateData.updates,
    );
  }

  /**
   * Elimina una moneda de una suboficina
   *
   * Si la moneda no existe en la suboficina, lanza un error de no encontrado
   *
   * @param {string | Types.ObjectId} subOfficeId - ID de la suboficina
   * @param {string | Types.ObjectId} currencyId - ID de la moneda a eliminar
   * @returns {Promise<string>} Un mensaje de confirmación
   */
  @Delete(':subOfficeId/currencies/:currencyId')
  async deleteCurrencyFromSubOffice(
    @Param('subOfficeId') subOfficeId: string | Types.ObjectId,
    @Param('currencyId') currencyId: string | Types.ObjectId,
  ): Promise<string> {
    return this.subOfficeService.deleteCurrencyFromSubOffice(
      subOfficeId,
      currencyId,
    );
  }
  /**
   * Elimina las monedas con valor null de todas las suboficinas
   *
   * @returns {Promise<string>} - Promesa que se resuelve con el mensaje de confirmación
   */
  @Delete('clean-null-currencies')
  async cleanNullCurrencies(): Promise<string> {
    try {
      await this.subOfficeService.cleanNullCurrencies();
      return 'Monedas null eliminadas con éxito';
    } catch (error) {
      throw new Error(`Error al eliminar monedas null: ${error.message}`);
    }
  }

  /**
   * Elimina una suboficina
   *
   * @param {string} id - ID de la suboficina a eliminar
   * @returns {Promise<string>} - Promesa que se resuelve con el ID de la suboficina eliminada
   */
  @Delete(':id')
  delete(@Param('id') id: string | Types.ObjectId): Promise<string> {
    return this.subOfficeService.delete(id);
  }
}
