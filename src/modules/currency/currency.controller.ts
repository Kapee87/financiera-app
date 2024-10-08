/* eslint-disable */
/**
 * Controlador para la gestión de monedas
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar monedas
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
} from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { Currency } from 'src/schemas/currency.schema';

@Controller('currencies')
export class CurrencyController {
  /**
   * Constructor
   *
   * @param {CurrencyService} currencyService - Servicio para la gestión de monedas
   */
  constructor(private readonly currencyService: CurrencyService) {}

  /**
   * Crea una moneda
   *
   * @param {Partial<Currency>} currencyData - Información de la moneda a crear
   *
   * @returns {Promise<Currency>} - Moneda creada
   */
  @Post()
  create(@Body() currencyData: Partial<Currency>) {
    return this.currencyService.create(currencyData);
  }

  /**
   * Obtiene todas las monedas
   *
   * @returns {Promise<Currency[]>} - Lista de monedas
   */
  @Get()
  findAll() {
    return this.currencyService.findAll();
  }

  /**
   * Obtiene una moneda por su ID
   *
   * @param {string} id - ID de la moneda a obtener
   *
   * @returns {Promise<Currency>} - Moneda obtenida
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.currencyService.findOne(id);
  }

  /**
   * Actualiza una moneda
   *
   * @param {string} id - ID de la moneda a actualizar
   * @param {Partial<Currency>} currencyData - Información de la moneda a actualizar
   *
   * @returns {Promise<Currency>} - Moneda actualizada
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() currencyData: Partial<Currency>) {
    return this.currencyService.update(id, currencyData);
  }

  /**
   * Elimina una moneda
   *
   * @param {string} id - ID de la moneda a eliminar
   *
   * @returns {Promise<Currency>} - Moneda eliminada
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.currencyService.delete(id);
  }
}
