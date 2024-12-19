/* eslint-disable */
import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { Balance } from 'src/schemas/balance.schema';

@Controller('balance')
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

  @Post('calculate/:subOfficeId/:usdRate')
  async calculateBalance(
    @Param('subOfficeId') subOfficeId: string,
    @Param('usdRate') usdRate: number,
  ): Promise<Balance> {
    return this.balanceService.calculateBalance(subOfficeId, usdRate);
  }

  @Delete('all')
  async delete(): Promise<string> {
    return this.balanceService.deleteAll();
  }
}
