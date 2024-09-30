/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOfficeDto } from 'src/dtos/create-office.dto';
import { UpdateOfficeDto } from 'src/dtos/update-office.dto';
import { Office } from 'src/schemas/office.schema';

@Injectable()
export class OfficeService {
  constructor(@InjectModel(Office.name) private officeModel: Model<Office>) {}

  async create(officeData: Partial<CreateOfficeDto>): Promise<Office> {
    try {
      const office = new this.officeModel(officeData);
      return await office.save();
    } catch (error) {
      throw new Error(`Error al crear la oficina: ${error.message}`);
    }
  }

  async findAll(): Promise<Office[]> {
    try {
      return await this.officeModel.find().exec();
    } catch (error) {
      throw new Error(`Error al obtener las oficinas: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Office> {
    try {
      return await this.officeModel.findById(id).exec();
    } catch (error) {
      throw new Error(
        `Error al obtener la oficina con id ${id}: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    officeData: Partial<UpdateOfficeDto>,
  ): Promise<Office> {
    try {
      return await this.officeModel
        .findByIdAndUpdate(id, officeData, { new: true })
        .exec();
    } catch (error) {
      throw new Error(
        `Error al actualizar la oficina con id ${id}: ${error.message}`,
      );
    }
  }

  async delete(id: string): Promise<Office> {
    try {
      return await this.officeModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new Error(
        `Error al eliminar la oficina con id ${id}: ${error.message}`,
      );
    }
  }
}
