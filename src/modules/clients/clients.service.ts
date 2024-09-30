/* eslint-disable */
/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateClientDto } from 'src/dtos/create-client.dto';
import { UpdateClientDto } from 'src/dtos/update-client.dto';
import { Client } from 'src/schemas/clients.schema';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private readonly expenseModel: Model<Client>,
  ) {}

  async create(createClientsDto: CreateClientDto): Promise<Client> {
    const createdClients = new this.expenseModel(createClientsDto);
    return createdClients.save();
  }

  async findAll(): Promise<Client[]> {
    return this.expenseModel.find().exec();
  }

  async findOne(id: string): Promise<Client> {
    return this.expenseModel.findById(id).exec();
  }

  async update(
    id: string,
    updateClientsDto: Partial<UpdateClientDto>,
  ): Promise<Client> {
    return this.expenseModel
      .findByIdAndUpdate(id, updateClientsDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.expenseModel.findByIdAndDelete(id).exec();
  }
}
