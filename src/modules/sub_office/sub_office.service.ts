/* eslint-disable */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    return this.sub_officeModel
      .find()
      .populate({
        path: 'currencies.currency',
        model: 'Currency',
      })
      .populate('users', 'username lastname _id')
      .exec();
  }

  async findOne(id: string): Promise<SubOffice> {
    const subOffice = await this.sub_officeModel.findById(id).exec();
    if (!subOffice) {
      throw new NotFoundException(`No se encontró la sucursal con ID ${id}`);
    }
    return subOffice;
  }

  async update(id: string, sub_officeData: Partial<any>): Promise<SubOffice> {
    const subOffice = await this.sub_officeModel.findById(id).exec();
    if (!subOffice) {
      throw new NotFoundException(`No se encontró la sucursal con ID ${id}`);
    }

    // Validar que las currencies no se repitan
    const currencyIds = subOffice.currencies.map(c => c.currency.toString());
    const idsToBeUpdated = Object.keys(sub_officeData.currencies || {});
    const repeatedIds = idsToBeUpdated.filter(id => currencyIds.includes(id));
    if (repeatedIds.length > 0) {
      throw new BadRequestException(
        `La(s) moneda(s) con ID(s) ${repeatedIds.join(', ')} ya se encuentran en la sucursal con ID ${id}`,
      );
    }

    // Validar que los usuarios no se repitan
    const userIds = subOffice.users.map(u => u.toString());
    const usersToBeUpdated = sub_officeData.users || [];
    const repeatedUserIds = usersToBeUpdated.filter((id: string) => userIds.includes(id));
    if (repeatedUserIds.length > 0) {
      throw new BadRequestException(
        `El(os) usuario(s) con ID(s) ${repeatedUserIds.join(', ')} ya se encuentran en la sucursal con ID ${id}`,
      );
    }
    const updatedSub_office = this.sub_officeModel
      .findByIdAndUpdate(id, sub_officeData, { new: true })
      .exec();
    if (!updatedSub_office) {
      throw new NotFoundException(`No se encontró la sucursal con ID ${id}`);
    }

    return updatedSub_office;
  }

  async updateCurrencyStock(
    subOfficeId: string,
    currencyId: string,
    amount: number,
    operation: 'increase' | 'decrease',
  ): Promise<void> {
    const subOffice = await this.sub_officeModel.findById(subOfficeId);

    if (!subOffice) {
      throw new NotFoundException(
        `No se encontró la sucursal con ID ${subOfficeId}`,
      );
    }

    const currencyInSubOffice = subOffice.currencies.find(
      (c) => c.currency.toString() === currencyId.toString(),
    );

    if (!currencyInSubOffice) {
      throw new NotFoundException(
        `La moneda con el ID ${currencyId} no se encuentra en la sucursal con ID ${subOfficeId}`,
      );
    }

    if (operation === 'increase') {
      currencyInSubOffice.stock += amount;
    } else if (operation === 'decrease') {
      if (currencyInSubOffice.stock < amount) {
        throw new Error('Stock insuficiente para realizar esta operación');
      }
      currencyInSubOffice.stock -= amount;
    }

    await subOffice.save();
  }

  async delete(id: string): Promise<string> {
    const deletedSub_office = this.sub_officeModel.findByIdAndDelete(id).exec();

    if (!deletedSub_office) {
      throw new NotFoundException(`No se encontró la sucursal con ID ${id}`);
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
