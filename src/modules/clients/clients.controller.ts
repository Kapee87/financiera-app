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
import { CreateClientDto } from 'src/dtos/create-client.dto';
import { UpdateClientDto } from 'src/dtos/update-client.dto';
import { ClientsService } from './clients.service';
import { Types } from 'mongoose';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() createClientsDto: CreateClientDto) {
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

  @Patch(':id')
  update(
    @Param('id') id: string | Types.ObjectId,
    @Body() updateClientsDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string | Types.ObjectId) {
    return this.clientsService.remove(id);
  }

  @Delete()
  removeAll(): string {
    return this.clientsService.removeAll();
  }
}
