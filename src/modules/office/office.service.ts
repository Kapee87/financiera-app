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
    const office = new this.officeModel(officeData);
    return office.save();
  }

  async findAll(): Promise<Office[]> {
    return this.officeModel.find().exec();
  }

  async findOne(id: string): Promise<Office> {
    return this.officeModel.findById(id).exec();
  }

  async update(
    id: string,
    officeData: Partial<UpdateOfficeDto>,
  ): Promise<Office> {
    return this.officeModel
      .findByIdAndUpdate(id, officeData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Office> {
    return this.officeModel.findByIdAndDelete(id).exec();
  }
}
