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
import { SubOfficeService } from './sub_office.service';

import { Error } from 'mongoose';
import { SubOffice } from 'src/schemas/sub_office.schema';

@Controller('sub_offices')
export class SubOfficeController {
  constructor(private readonly subOfficeService: SubOfficeService) {}

  @Post()
  create(@Body() subOfficeData: Partial<SubOffice>) {
    try {
      return this.subOfficeService.create(subOfficeData);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get()
  findAll() {
    return this.subOfficeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subOfficeService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() officeData: Partial<SubOffice>) {
    return this.subOfficeService.update(id, officeData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.subOfficeService.delete(id);
  }

  
}
