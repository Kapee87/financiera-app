/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';

import { Transaction } from 'src/schemas/transaction.schema';
import { CreateTransactionDto } from 'src/dtos/create-transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() transactionData: CreateTransactionDto) {
    return this.transactionService.create(transactionData);
  }

  @Get()
  findAll() {
    return this.transactionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() transactionData: Partial<Transaction>,
  ) {
    return this.transactionService.update(id, transactionData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.transactionService.delete(id);
  }
}
