/* eslint-disable */
import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { Balance } from 'src/schemas/balance.schema';

/**
 * Controlador para la gestion de balances
 *
 * Contiene metodos para obtener, calcular y eliminar balances
 *
 */
@Controller('balance')
export class BalanceController {
  /**
   * Servicio para la gestion de balances
   */
  constructor(private readonly balanceService: BalanceService) {}

  /**
   * Obtiene todos los balances
   * @returns un arreglo de balances
   */
  @Get()
  async findAll(): Promise<Balance[]> {
    return this.balanceService.findAll();
  }

  /**
   * Obtiene un balance por su id
   * @param id id del balance a obtener
   * @returns el balance obtenido
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Balance> {
    return this.balanceService.findOne(id);
  }

  /**
   * Calcula el balance para una suboficina y una tasa de cambio
   * @param subOfficeId id de la suboficina
   * @param usdRate tasa de cambio
   * @returns el balance calculado
   */
  @Post('calculate/:subOfficeId/:usdRate')
  async calculateBalance(
    @Param('subOfficeId') subOfficeId: string,
    @Param('usdRate') usdRate: number,
  ): Promise<Balance> {
    return this.balanceService.calculateBalance(subOfficeId, usdRate);
  }

  /**
   * Elimina todos los balances
   * @returns un mensaje de confirmaci n
   */
  @Delete('all')
  async delete(): Promise<string> {
    return this.balanceService.deleteAll();
  }
}
