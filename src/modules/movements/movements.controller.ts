/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';

import { CreateMovementDto } from 'src/dtos/create-movement.dto';
import { UpdateMovementDto } from 'src/dtos/update-movement.dto';
import { MovementService } from './movements.service';
import { MovementFilterDto } from 'src/dtos/movement-filter.dto';
import { AdminGuard } from 'src/guards/admin-guard';

@Controller('movements')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @Post()
  create(@Body() createMovementDto: CreateMovementDto) {
    return this.movementService.create(createMovementDto);
  }

  @Post('/filter/')
  findByFilter(@Body() movementFilterDto: MovementFilterDto) {
    return this.movementService.findByFilter(movementFilterDto);
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

  // @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const deletedMovement = await this.movementService.remove(id);
      return 'Movimiento eliminado exitosamente';
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete()
  async removeAll() {
    return this.movementService.removeAll();
  }

  /*  ----/ Se deja por si se necesita para hacer pruebas /-----
  
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMovementDto: UpdateMovementDto,
  ) {
    if (updateMovementDto.amount || updateMovementDto.type) {
      throw new BadRequestException(
        'No se pueden actualizar los campos amount y type, en su lugar elimine el movimiento y cree uno nuevo',
      );
    }
    return this.movementService.update(id, updateMovementDto);
  } */
}
