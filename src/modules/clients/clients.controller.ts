/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { CreateClientDto } from 'src/dtos/create-client.dto';
import { UpdateClientDto } from 'src/dtos/update-client.dto';
import { ClientsService } from './clients.service';
import { Types } from 'mongoose';
import { UpdateClientArraysDto } from 'src/dtos/update-client-array.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() createClientsDto: CreateClientDto) {
    console.log(createClientsDto);

    return this.clientsService.create(createClientsDto);
  }

  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string | Types.ObjectId) {
    return this.clientsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string | Types.ObjectId,
    @Body() updateClientDto: Partial<UpdateClientDto>,
  ) {
    console.log(updateClientDto);

    return this.clientsService.update(id, updateClientDto);
  }

  @Patch(':id/arrays')
  updateArrays(
    @Param('id') id: string | Types.ObjectId,
    @Body() updateArraysDto: UpdateClientArraysDto,
  ) {
    return this.clientsService.updateArrays(id, updateArraysDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string | Types.ObjectId) {
    console.log('delete by id');

    try {
      const deletedClient = await this.clientsService.remove(id);
      return 'Cliente eliminado exitosamente';
    } catch (err) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
  }

  @Delete()
  removeAll(): string {
    return this.clientsService.removeAll();
  }
}
