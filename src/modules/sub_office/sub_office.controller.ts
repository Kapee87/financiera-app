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

import { Error, Types } from 'mongoose';
import { SubOffice } from 'src/schemas/sub_office.schema';
import { createSubOfficeDto } from 'src/dtos/create-subOffice.dto';
import { updateSubOfficeDto } from 'src/dtos/update-subOffice.dto';

@Controller('sub_offices')
export class SubOfficeController {
  constructor(private readonly subOfficeService: SubOfficeService) {}

  @Post()
  create(@Body() subOfficeData: Partial<createSubOfficeDto>) {
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
  update(
    @Param('id') id: string | Types.ObjectId,
    @Body() officeData: Partial<updateSubOfficeDto>,
  ) {
    return this.subOfficeService.update(id, officeData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.subOfficeService.delete(id);
  }
}
