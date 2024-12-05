/* eslint-disable */
/* eslint-disable */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateClientDto } from 'src/dtos/create-client.dto';
import { UpdateClientDto } from 'src/dtos/update-client.dto';
import { Client, ClientDocument } from 'src/schemas/clients.schema';
import * as bcrypt from 'bcrypt';
import {
  OperationType,
  UpdateClientArraysDto,
} from 'src/dtos/update-client-array.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  async create(createClientsDto: CreateClientDto): Promise<Client> {
    try {
      const createdClients = await this.clientModel.create({
        name: createClientsDto.name,
        lastname: createClientsDto.lastname,
        money: createClientsDto.money,
        totalDebts: createClientsDto.totalDebts,
        totalPayments: createClientsDto.totalPayments,
        phone: createClientsDto.phone,
        mail: createClientsDto.mail,
        transactions: createClientsDto.transactions,
        movements: createClientsDto.movements,
        observations: createClientsDto.observations,
      });
      console.log(createdClients);

      return createdClients;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<Client[]> {
    return this.clientModel
      .find()
      .populate('transactions')
      .populate('movements')
      .exec();
  }

  async findOne(id: string | Types.ObjectId): Promise<Client> {
    const clientId = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    return this.clientModel.findById(clientId).exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateClientDto: Partial<UpdateClientDto>,
  ): Promise<Client> {
    const clientId = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    console.log(updateClientDto);

    return this.clientModel
      .findByIdAndUpdate(clientId, updateClientDto, { new: true })
      .exec();
  }

  async updateArrays(
    id: string | Types.ObjectId,
    updateArraysDto: UpdateClientArraysDto,
  ): Promise<Client> {
    const clientId = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    const { operation, type, elements } = updateArraysDto;

    const updateOperation =
      operation === OperationType.ADD ? '$addToSet' : '$pull';

    const updateQuery = {
      [updateOperation]: {
        [type]:
          operation === OperationType.ADD
            ? { $each: elements }
            : { $in: elements },
      },
    };

    return this.clientModel
      .findByIdAndUpdate(clientId, updateQuery, { new: true })
      .exec();
  }

  async remove(id: string | Types.ObjectId): Promise<void> {
    const clientId = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    await this.clientModel.findByIdAndDelete(clientId).exec();
  }

  removeAll(): string {
    try {
      this.clientModel.deleteMany({}).exec();
      return 'Todos los clientes han sido eliminados';
    } catch (error) {}
  }
}
