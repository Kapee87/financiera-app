/* eslint-disable */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createSubOfficeDto } from 'src/dtos/create-subOffice.dto';
import { updateSubOfficeDto } from 'src/dtos/update-subOffice.dto';
import { SubOffice } from 'src/schemas/sub_office.schema';

@Injectable()
export class SubOfficeService {
  constructor(
    @InjectModel(SubOffice.name) private sub_officeModel: Model<SubOffice>,
  ) {}

  async create(
    sub_officeData: Partial<createSubOfficeDto>,
  ): Promise<SubOffice> {
    try {
      const newSub_office = new this.sub_officeModel(sub_officeData);
      return await newSub_office.save();
    } catch (error) {
      if (error.code === 11000) {
        // Este es el código de error para clave duplicada en MongoDB
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        throw new ConflictException(
          `Ya existe una sucursal con ${field}: ${value}`,
        );
      }
      throw error; // Si no es un error de duplicado, lanzamos el error original
    }
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

  async update(
    id: string | Types.ObjectId,
    sub_officeData: Partial<updateSubOfficeDto>,
  ): Promise<SubOffice> {
    let objectId: Types.ObjectId;

    try {
      objectId = new Types.ObjectId(id);
    } catch (error) {
      throw new BadRequestException(`ID de sucursal inválido: ${id}`);
    }
    const subOffice = await this.sub_officeModel.findById(objectId).exec();

    if (!subOffice) {
      throw new NotFoundException(`No se encontró la sucursal con ID ${id}`);
    }

    // Manejar la actualización de monedas
    if (sub_officeData.currencies) {
      const currentCurrencies = subOffice.currencies || [];

      for (const currencyData of sub_officeData.currencies) {
        const currencyId = currencyData.currency;

        if (Types.ObjectId.isValid(currencyId)) {
          try {
            const objectId = new Types.ObjectId(currencyId);

            const existingCurrencyIndex = currentCurrencies.findIndex((c) =>
              c.currency.equals(objectId),
            );

            if (existingCurrencyIndex !== -1) {
              // Actualizar moneda existente
              currentCurrencies[existingCurrencyIndex].stock +=
                currencyData.stock;
            } else {
              // Agregar nueva moneda
              currentCurrencies.push({
                currency: objectId,
                stock: currencyData.stock,
              });
            }
          } catch (error) {
            console.warn(
              `Error al procesar la moneda con ID ${currencyId}: ${error.message}`,
            );
          }
        } else {
          console.warn(`ID de moneda inválido ignorado: ${currencyId}`);
        }
      }

      subOffice.currencies = currentCurrencies;
    }
    // Manejar la actualización de usuarios
    if (sub_officeData.users) {
      const validUserIds = sub_officeData.users.filter((id) => {
        try {
          new Types.ObjectId(id);
          return true;
        } catch {
          console.warn(`ID de usuario inválido ignorado: ${id}`);
          return false;
        }
      });

      const currentUserIds = subOffice.users.map((u) => u);
      const newUserIds = validUserIds.filter(
        (id) => !currentUserIds.includes(id),
      );
      subOffice.users = [
        ...subOffice.users,
        ...newUserIds.map((id) => new Types.ObjectId(id)),
      ];
    }

    // Actualizar otros campos
    for (const [key, value] of Object.entries(sub_officeData)) {
      if (key !== 'currencies' && key !== 'users') {
        subOffice[key] = value;
      }
    }

    // Guardar los cambios
    try {
      const updatedSubOffice = await subOffice.save();
      return updatedSubOffice;
    } catch (error) {
      throw new BadRequestException(
        `Error al guardar la sucursal: ${error.message}`,
      );
    }
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
