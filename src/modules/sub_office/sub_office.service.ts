/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubOffice } from 'src/schemas/sub_office.schema';

@Injectable()
export class SubOfficeService {
  constructor(
    @InjectModel(SubOffice.name) private sub_officeModel: Model<SubOffice>,
  ) {}

  async create(sub_officeData: Partial<SubOffice>): Promise<SubOffice> {
    const newSub_office = new this.sub_officeModel(sub_officeData);
    return newSub_office.save();
  }

  async findAll(): Promise<SubOffice[]> {
    return this.sub_officeModel.find().exec();
  }

  async findOne(id: string): Promise<SubOffice> {
    const subOffice = await this.sub_officeModel.findById(id).exec();
    if (!subOffice) {
      throw new NotFoundException(`SubOffice with ID ${id} not found`);
    }
    return subOffice;
  }

  async update(id: string, sub_officeData: Partial<any>): Promise<SubOffice> {
    const updatedSub_office = this.sub_officeModel
      .findByIdAndUpdate(id, sub_officeData, { new: true })
      .exec();
    if (!updatedSub_office) {
      throw new NotFoundException(`SubOffice with ID ${id} not found`);
    }

    return updatedSub_office;
  }

  async delete(id: string): Promise<string> {
    const deletedSub_office = this.sub_officeModel.findByIdAndDelete(id).exec();

    if (!deletedSub_office) {
      throw new NotFoundException(`SubOffice with ID ${id} not found`);
    }
    return 'Sub agencia eliminada correctamente';
  }

  /* probar y ajustar si hace falta
  // Método en el modelo de SubOffice
async getCurrencyStock(currencyId: string): Promise<number> {
  const currency = await Currency.findById(currencyId);

  if (!currency) {
    throw new NotFoundException(`Currency with ID ${currencyId} not found`);
  }

  const stock = this.currencies.find((c) => c.currency.equals(currencyId))?.stock;

  if (stock === undefined) {
    throw new NotFoundException(`Currency with ID ${currencyId} not found in this sub-office`);
  }

  return stock;
} 
   */
}
