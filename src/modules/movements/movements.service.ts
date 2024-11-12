/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMovementDto } from 'src/dtos/create-movement.dto';
import { Movement, MovementDocument } from 'src/schemas/movement.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class MovementService {
  constructor(
    @InjectModel(Movement.name) private expenseModel: Model<MovementDocument>,
  ) {}

  async create(createMovementDto: CreateMovementDto): Promise<Movement> {
    try {
      const createdMovement = await this.expenseModel.create({
        date: new Date(),
        amount: createMovementDto.amount,
        description: createMovementDto.description,
        category: createMovementDto.category,
        type: createMovementDto.type,
        user: createMovementDto.user,
        sub_office: createMovementDto.subOffice,
      });
      console.log(createdMovement);

      return createdMovement;
    } catch (error) {
      console.log(error);

      throw new BadRequestException(error.message);
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
    try {
      return await this.expenseModel
        .findByIdAndUpdate(id, updateMovementDto, { new: true })
        .exec();
    } catch (error) {
      throw new BadRequestException(error.message);
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
