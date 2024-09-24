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
import { OfficeService } from './office.service';
import { Office } from 'src/schemas/office.schema';
import { Error } from 'mongoose';

@Controller('offices')
export class OfficeController {
  constructor(private readonly officeService: OfficeService) {}

  @Post()
  create(@Body() officeData: Partial<Office>) {
    try {
      return this.officeService.create(officeData);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get()
  findAll() {
    return this.officeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.officeService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() officeData: Partial<Office>) {
    return this.officeService.update(id, officeData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.officeService.delete(id);
  }
}
