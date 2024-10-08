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
  create(@Body() subOfficeData: Partial<createSubOfficeDto>) {
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
  findAll() {
    return this.subOfficeService.findAll();
  }

  /**
   * Obtiene una suboficina por su ID
   *
   * @param {string} id - ID de la suboficina a obtener
   * @returns {Promise<SubOffice>} - Promesa que se resuelve con la suboficina obtenida
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
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
  ) {
    return this.subOfficeService.update(id, officeData);
  }

  /**
   * Elimina una suboficina
   *
   * @param {string} id - ID de la suboficina a eliminar
   * @returns {Promise<string>} - Promesa que se resuelve con el ID de la suboficina eliminada
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.subOfficeService.delete(id);
  }
}
