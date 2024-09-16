/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubOffice } from 'src/schemas/sub_office.schema';

@Injectable()
export class SubOfficeService {
  constructor(
    @InjectModel(SubOffice.name) private sub_officeModel: Model<SubOffice>,
  ) {}

  async create(sub_officeData: Partial<any>): Promise<SubOffice> {
    const sub_office = new this.sub_officeModel(sub_officeData);
    return sub_office.save();
  }

  async findAll(): Promise<SubOffice[]> {
    return this.sub_officeModel.find().exec();
  }

  async findOne(id: string): Promise<SubOffice> {
    return this.sub_officeModel.findById(id).exec();
  }

  async update(id: string, sub_officeData: Partial<any>): Promise<SubOffice> {
    return this.sub_officeModel
      .findByIdAndUpdate(id, sub_officeData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<SubOffice> {
    return this.sub_officeModel.findByIdAndDelete(id).exec();
  }
}
