/* eslint-disable */
import { Controller, Get, Param } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { Balance } from 'src/schemas/balance.schema';

@Controller('balances')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  async findAll(): Promise<Balance[]> {
    return this.balanceService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Balance> {
    return this.balanceService.findOne(id);
  }
}
