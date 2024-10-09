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
   * Vacía el array de sub_oficinas de una oficina
   *
   * Recibe el id de la oficina a vaciar
   *
   * @param id Identificador de la oficina a vaciar
   * @returns La oficina con el array de sub_oficinas vacío
   */
  @Put(':id/clear-sub-offices')
  clearSubOffices(@Param('id') id: string) {
    return this.officeService.clearSubOffices(id);
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

  /**
   * Obtiene el stock total de cada moneda en todas las sucursales de esta oficina
   *
   * @param id Identificador de la oficina
   * @returns Un objeto con los stocks de cada moneda en todas las sucursales
   */
  @Get(':id/stocks')
  getStocks(@Param('id') id: string) {
    console.log('paso por controller');
    return this.officeService.getStocks(id);
  }
}
