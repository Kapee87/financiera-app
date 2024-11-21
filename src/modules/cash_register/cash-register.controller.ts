/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Delete,
  BadRequestException,
} from '@nestjs/common';

import { CreateCashRegisterDto } from '../../dtos/create-cash-register.dto';
import { UpdateCashRegisterDto } from '../../dtos/update-cash-register.dto';
import { CashRegisterService } from './cash_register.service';
import {
  CashRegister,
  CashRegisterDocument,
} from 'src/schemas/cash_registers.schema';
import { Types } from 'mongoose';
import { CloseCashRegisterDto } from 'src/dtos/close-cash-register.dto';

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
    @Param('id') id: string | Types.ObjectId,
    @Body() closeCashRegisterDto: CloseCashRegisterDto,
  ): Promise<CashRegister> {
    return this.cashRegisterService.closeDay(id, closeCashRegisterDto);
  }

  @Get(':date')
  getCashRegisterByDate(@Param('date') date: string): Promise<CashRegister> {
    return this.cashRegisterService.getCashRegisterByDate(date);
  }

  @Get()
  listAllCashRegisters(): Promise<CashRegister[]> {
    return this.cashRegisterService.listAllCashRegisters();
  }

  @Get('current/:subOfficeId')
  async getCurrentCashRegisterForSubOffice(
    @Param('subOfficeId') subOfficeId: string | Types.ObjectId,
  ): Promise<CashRegisterDocument | null> {
    try {
      const cashRegister =
        await this.cashRegisterService.getCurrentCashRegisterForSubOffice(
          subOfficeId,
        );
      if (!cashRegister) {
        throw new BadRequestException('No hay caja abierta para el dia de hoy');
      }
      console.log(cashRegister);

      return cashRegister;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':subOfficeId/current-stock-total')
  calculateCurrentStockTotal(
    @Param('subOfficeId') subOfficeId: string | Types.ObjectId,
    @Body('usd_rate') usd_rate: number,
  ): Promise<number> {
    console.log(usd_rate);

    return this.cashRegisterService.calculateCurrentStockTotal(
      subOfficeId,
      usd_rate,
    );
  }

  @Delete()
  deleteAllForDevelopment(): Promise<any> {
    return this.cashRegisterService.deleteAllForDevelopment();
  }
}
