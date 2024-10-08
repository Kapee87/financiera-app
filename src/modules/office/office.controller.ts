/* eslint-disable */
/**
 * Controlador para oficinas
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar oficinas
 *
  Juan Carlos Gonzalez Ibarra
 * @since 2022-03-04
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
import { OfficeService } from './office.service';
import { Office } from 'src/schemas/office.schema';

@Controller('offices')
export class OfficeController {
  /**
   * Constructor de la clase
   *
   * @param officeService Servicio de oficinas
   */
  constructor(private readonly officeService: OfficeService) {}

  /**
   * Crea una nueva oficina
   *
   * Recibe los datos de la oficina a crear
   *
   * @param officeData Datos de la oficina a crear
   * @returns La oficina creada
   */
  @Post()
  create(@Body() officeData: Partial<Office>) {
    return this.officeService.create(officeData);
  }

  /**
   * Obtiene todas las oficinas
   *
   * @returns Un arreglo de oficinas
   */
  @Get()
  findAll() {
    return this.officeService.findAll();
  }

  /**
   * Obtiene una oficina por su id
   *
   * @param id Identificador de la oficina a obtener
   * @returns La oficina obtenida
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.officeService.findOne(id);
  }

  /**
   * Actualiza una oficina
   *
   * Recibe el id de la oficina a actualizar y los datos a actualizar
   *
   * @param id Identificador de la oficina a actualizar
   * @param officeData Datos a actualizar
   * @returns La oficina actualizada
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() officeData: Partial<Office>) {
    return this.officeService.update(id, officeData);
  }

  /**
   * Elimina una oficina
   *
   * Recibe el id de la oficina a eliminar
   *
   * @param id Identificador de la oficina a eliminar
   * @returns La oficina eliminada
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.officeService.delete(id);
  }
}
