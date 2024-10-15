/* eslint-disable */
/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async findOne(id: string | Types.ObjectId): Promise<Client> {
    const clientId = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    return this.expenseModel.findById(clientId).exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateClientsDto: Partial<UpdateClientDto>,
  ): Promise<Client> {
    const clientId = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    return this.expenseModel
      .findByIdAndUpdate(clientId, updateClientsDto, { new: true })
      .exec();
  }

  async remove(id: string | Types.ObjectId): Promise<void> {
    const clientId = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    await this.expenseModel.findByIdAndDelete(clientId).exec();
  }
}
