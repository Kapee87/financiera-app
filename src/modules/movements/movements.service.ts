/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateMovementDto } from 'src/dtos/create-movement.dto';
import { Movement, MovementDocument } from 'src/schemas/movement.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SubOfficeService } from '../sub_office/sub_office.service';
import { CashRegisterService } from '../cash_register/cash_register.service';
import { MovementFilterDto } from 'src/dtos/movement-filter.dto';

@Injectable()
export class MovementService {
  constructor(
    @InjectModel(Movement.name) private movementModel: Model<MovementDocument>,
    @InjectConnection() private connection: Connection,
    private subOfficeService: SubOfficeService,
    private cashService: CashRegisterService,
  ) {}

  async create(createMovementDto: CreateMovementDto): Promise<Movement> {
    const isCashRegisterOpen = await this.cashService.isCashRegisterOpen(
      createMovementDto.subOffice,
    );
    if (!isCashRegisterOpen) {
      throw new BadRequestException('La caja no esta abierta');
    }

    const session = await this.connection.startSession();
    console.log('createMovementDto', createMovementDto);

    try {
      const createdMovement = await session.withTransaction(async () => {
        // Actualizar el stock de la moneda correspondiente
        const updatedStock = await this.updateStock(
          createMovementDto.subOffice,
          createMovementDto.currency,
          createMovementDto.amount,
          createMovementDto.category,
          session,
        );
        console.log('updatedStock: ' + updatedStock);

        // Crear el movimiento
        return await this.movementModel.create({
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
    console.log('updateStock');
    console.log('type: ' + type);
    console.log('amount: ' + amount);

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
      const movements = await this.movementModel
        .find()
        .populate('user', '_id username email')
        .populate('currency', '_id name code')
        .populate('sub_office', '_id name')
        .exec();
      return movements;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findOne(id: string): Promise<Movement> {
    try {
      return await this.movementModel.findById(id).exec();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findByFilter(movementFilterDto): Promise<Movement[]> {
    console.log(movementFilterDto);
    try {
      const normalizedFilter = this.normalizeFilter(movementFilterDto);
      if (Object.keys(normalizedFilter).length === 0) {
        throw new BadRequestException(
          'No se encontraron filtros para la busqueda',
        );
      }
      const movements = await this.movementModel
        .find(normalizedFilter)
        .populate({
          path: 'user',
          select: '_id username email',
        })
        .populate({
          path: 'sub_office',
          select: '_id name',
        })
        .populate({
          path: 'currency',
          select: '_id name code',
        })
        .exec();
      return movements;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getMovementsByDate(date: Date): Promise<Movement[]> {
    try {
      return await this.movementModel.find({ date }).exec();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getMovementsByType(category: string): Promise<Movement[]> {
    try {
      return await this.movementModel.find({ category }).exec();
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
        const movement = await this.movementModel.findById(id).exec();
        if (!movement) {
          throw new NotFoundException(
            `No se encontró el movimiento con id ${id}`,
          );
        }
        // Actualizar el movimiento
        return await this.movementModel
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
    const session = await this.connection.startSession();
    try {
      const movement = await this.movementModel.findById(id).exec();
      if (!movement) {
        throw new Error(`No se encontró el movimiento con id ${id}`);
      }

      const isCashRegisterOpen = await this.cashService.isCashRegisterOpen(
        movement.sub_office,
      );
      console.log(isCashRegisterOpen);

      await session.withTransaction(async () => {
        if (
          isCashRegisterOpen &&
          movement.date.toDateString() === new Date().toDateString()
        ) {
          // Restar o sumar el stock de la currency en la suboficina
          if (movement.type === 'ingreso') {
            await this.subOfficeService.updateCurrencyStock(
              movement.sub_office,
              movement.currency,
              movement.amount,
              'decrease',
              session,
            );
          } else if (movement.type === 'egreso') {
            await this.subOfficeService.updateCurrencyStock(
              movement.sub_office,
              movement.currency,
              movement.amount,
              'increase',
              session,
            );
          }
        }
        // Eliminar el movimiento
        await this.movementModel.findByIdAndDelete(id).exec();
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    } finally {
      await session.endSession();
    }
  }
  async removeAll() {
    await this.movementModel.deleteMany({}).exec();
    return { message: 'Deleted all movements' };
  }
  private normalizeFilter(filter: MovementFilterDto): any {
    if (filter.type) {
      filter.type = filter.type.toLowerCase();
    }
    if (filter.description) {
      filter.description = filter.description.toLowerCase();
    }
    if (filter.currency) {
      filter.currency = filter.currency.toLowerCase();
    }
    if (filter.subOffice) {
      filter.subOffice = filter.subOffice.toLowerCase();
    }
    if (filter.user) {
      filter.user = filter.user.toLowerCase();
    }
    return filter;
  }
}
