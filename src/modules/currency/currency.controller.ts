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
import { CurrencyService } from './currency.service';
import { Currency } from 'src/schemas/currency.schema';

@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  create(@Body() currencyData: Partial<Currency>) {
    return this.currencyService.create(currencyData);
  }

  @Get()
  findAll() {
    return this.currencyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.currencyService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() currencyData: Partial<Currency>) {
    return this.currencyService.update(id, currencyData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.currencyService.delete(id);
  }
}
