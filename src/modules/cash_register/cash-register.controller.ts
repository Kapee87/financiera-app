/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Delete,
} from '@nestjs/common';

import { CreateCashRegisterDto } from '../../dtos/create-cash-register.dto';
import { UpdateCashRegisterDto } from '../../dtos/update-cash-register.dto';
import { CashRegisterService } from './cash_register.service';
import { CashRegister } from 'src/schemas/cash_registers.schema';

@Controller('cash-register')
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @Post('start')
  startDay(
    @Body() createCashRegisterDto: CreateCashRegisterDto,
  ): Promise<CashRegister> {
    return this.cashRegisterService.startDay(createCashRegisterDto);
  }

  @Put('close/:id')
  closeDay(
    @Param('id') id: string,
    @Body() updateCashRegisterDto: UpdateCashRegisterDto,
  ): Promise<CashRegister> {
    return this.cashRegisterService.closeDay(id, updateCashRegisterDto);
  }

  @Get(':date')
  getCashRegisterByDate(@Param('date') date: string): Promise<CashRegister> {
    return this.cashRegisterService.getCashRegisterByDate(date);
  }

  @Get()
  listAllCashRegisters(): Promise<CashRegister[]> {
    return this.cashRegisterService.listAllCashRegisters();
  }
  @Delete()
  deleteAllForDevelopment(): Promise<any> {
    return this.cashRegisterService.deleteAllForDevelopment();
  }
}
