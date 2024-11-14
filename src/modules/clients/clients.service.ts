/* eslint-disable */
/* eslint-disable */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateClientDto } from 'src/dtos/create-client.dto';
import { UpdateClientDto } from 'src/dtos/update-client.dto';
import { Client, ClientDocument } from 'src/schemas/clients.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private expenseModel: Model<ClientDocument>,
  ) {}

  async create(createClientsDto: CreateClientDto): Promise<Client> {
    try {
      const hashedPassword = await bcrypt.hash(createClientsDto.password, 10);
      const createdClients = await this.expenseModel.create({
        name: createClientsDto.name,
        lastname: createClientsDto.lastname,
        password: hashedPassword,
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
    return this.expenseModel.find().exec();
  }

  async findOne(id: string | Types.ObjectId): Promise<Client> {
    const clientId = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    return this.expenseModel.findById(clientId).exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateClientDto: Partial<UpdateClientDto>,
  ): Promise<Client> {
    const clientId = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    console.log(updateClientDto);

    return this.expenseModel
      .findByIdAndUpdate(clientId, updateClientDto, { new: true })
      .exec();
  }

  async remove(id: string | Types.ObjectId): Promise<void> {
    const clientId = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    await this.expenseModel.findByIdAndDelete(clientId).exec();
  }

  removeAll(): string {
    try {
      this.expenseModel.deleteMany({}).exec();
      return 'Todos los clientes han sido eliminados';
    } catch (error) {}
  }
}
