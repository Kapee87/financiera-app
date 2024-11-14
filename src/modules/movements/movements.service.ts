/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateMovementDto } from 'src/dtos/create-movement.dto';
import { Movement, MovementDocument } from 'src/schemas/movement.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SubOfficeService } from '../sub_office/sub_office.service';

@Injectable()
export class MovementService {
  constructor(
    @InjectModel(Movement.name) private expenseModel: Model<MovementDocument>,
    @InjectConnection() private connection: Connection,
    private subOfficeService: SubOfficeService,
    private curencyService: SubOfficeService,
  ) {}

  async create(createMovementDto: CreateMovementDto): Promise<Movement> {
    const session = await this.connection.startSession();
    try {
      const createdMovement = await session.withTransaction(async () => {
        // Actualizar el stock de la moneda correspondiente
        await this.updateStock(
          createMovementDto.subOffice,
          createMovementDto.currency,
          createMovementDto.amount,
          createMovementDto.type,
          session,
        );

        // Crear el movimiento
        return await this.expenseModel.create({
          date: new Date(),
          amount: createMovementDto.amount,
          description: createMovementDto.description,
          category: createMovementDto.category,
          type: createMovementDto.type,
          user: createMovementDto.user,
          sub_office: createMovementDto.subOffice,
          currency: createMovementDto.currency,
        });
      });
      return createdMovement;
    } catch (error) {
      throw new BadRequestException(error.message);
    } finally {
      await session.endSession();
    }
  }
  private async updateStock(
    subOfficeId: string,
    currencyId: string,
    amount: number,
    type: string,
    session: any,
  ): Promise<void> {
    if (type === 'ingreso') {
      await this.subOfficeService.updateCurrencyStock(
        subOfficeId,
        currencyId,
        amount,
        'increase',
        session,
      );
    } else if (type === 'egreso') {
      await this.subOfficeService.updateCurrencyStock(
        subOfficeId,
        currencyId,
        amount,
        'decrease',
        session,
      );
    }
  }

  async findAll(): Promise<Movement[]> {
    try {
      return await this.expenseModel.find().exec();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findOne(id: string): Promise<Movement> {
    try {
      return await this.expenseModel.findById(id).exec();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getMovementsByDate(date: Date): Promise<Movement[]> {
    try {
      return await this.expenseModel.find({ date }).exec();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getMovementsByType(category: string): Promise<Movement[]> {
    try {
      return await this.expenseModel.find({ category }).exec();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async update(
    id: string,
    updateMovementDto: Partial<CreateMovementDto>,
  ): Promise<Movement> {
    const session = await this.connection.startSession();
    try {
      const updatedMovement = await session.withTransaction(async () => {
        const movement = await this.expenseModel.findById(id).exec();
        if (!movement) {
          throw new NotFoundException(
            `No se encontró el movimiento con id ${id}`,
          );
        }

        // Restar/sumar el monto anterior al stock
        await this.updateStock(
          movement.sub_office,
          movement.currency,
          movement.amount,
          movement.type === 'ingreso' ? 'decrease' : 'increase',
          session,
        );

        // Sumar/restar el monto nuevo al stock
        await this.updateStock(
          updateMovementDto.subOffice || movement.sub_office,
          updateMovementDto.currency || movement.currency,
          updateMovementDto.amount || movement.amount,
          updateMovementDto.type === 'ingreso' ? 'increase' : 'decrease',
          session,
        );

        // Actualizar el movimiento
        return await this.expenseModel
          .findByIdAndUpdate(id, updateMovementDto, { new: true })
          .exec();
      });
      return updatedMovement;
    } catch (error) {
      throw new BadRequestException(error.message);
    } finally {
      await session.endSession();
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.expenseModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  async removeAll() {
    await this.expenseModel.deleteMany({}).exec();
    return { message: 'Deleted all movements' };
  }
}
