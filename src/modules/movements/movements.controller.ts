/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CreateMovementDto } from 'src/dtos/create-movement.dto';
import { UpdateMovementDto } from 'src/dtos/update-movement.dto';
import { MovementService } from './movements.service';

@Controller('movements')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @Post()
  create(@Body() createMovementDto: CreateMovementDto) {
    console.log(createMovementDto);

    return this.movementService.create(createMovementDto);
  }

  @Get()
  findAll() {
    return this.movementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movementService.findOne(id);
  }

  @Get('date/:date')
  getMovementsByDate(@Param('date') date: Date) {
    return this.movementService.getMovementsByDate(date);
  }
  @Get('type/:type')
  getMovementsByType(@Param('type') category: string) {
    return this.movementService.getMovementsByType(category);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMovementDto: UpdateMovementDto,
  ) {
    return this.movementService.update(id, updateMovementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movementService.remove(id);
  }

  @Delete()
  async removeAll() {
    return this.movementService.removeAll();
  }
}
