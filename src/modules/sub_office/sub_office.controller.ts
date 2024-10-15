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

@Controller('sub_offices')
export class SubOfficeController {
  /**
   * Servicio para la gestión de suboficinas
   *
   * @private
   */
  constructor(private readonly subOfficeService: SubOfficeService) {}

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
  ): Promise<void> {
    return this.subOfficeService.updateCurrencyStock(
      subOfficeId,
      currencyId,
      amount,
      operation,
    );
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
