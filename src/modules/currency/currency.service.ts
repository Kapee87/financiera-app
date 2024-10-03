/* eslint-disable */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency } from 'src/schemas/currency.schema';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectModel(Currency.name) private currencyModel: Model<Currency>,
  ) {}

  async create(currencyData: Partial<Currency>): Promise<Currency> {
    const currency = new this.currencyModel(currencyData);
    try {
      const newCurrency = await currency.save();
      return newCurrency;
    } catch (error) {
      throw new BadRequestException(
        'Error al crear la moneda: ' + error.message,
      );
    }
  }

  async findAll(): Promise<Currency[]> {
    try {
      return await this.currencyModel.find().exec();
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener las monedas: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<Currency> {
    const currency = await this.currencyModel.findById(id).exec();
    if (!currency) {
      throw new NotFoundException(`No se encontró la moneda con ID ${id}`);
    }
    return currency;
  }

  async update(id: string, currencyData: Partial<Currency>): Promise<Currency> {
    const updatedCurrency = await this.currencyModel
      .findByIdAndUpdate(id, currencyData, { new: true })
      .exec();

    if (!updatedCurrency) {
      throw new NotFoundException(`No se encontró la moneda con ID ${id}`);
    }

    return updatedCurrency;
  }

  async delete(id: string): Promise<Currency> {
    const deletedCurrency = await this.currencyModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedCurrency) {
      throw new NotFoundException(`No es encontró la moneda con ID ${id}`);
    }

    return deletedCurrency;
  }
  async updateGlobalStock(
    currencyId: string,
    amount: number,
    operation: 'increase' | 'decrease' | 'set',
  ): Promise<void> {
    const currency = await this.currencyModel.findById(currencyId);

    if (!currency) {
      throw new NotFoundException(
        `No se encontró la moneda con ID ${currencyId}`,
      );
    }

    switch (operation) {
      case 'increase':
        currency.globalStock += amount;
        break;
      case 'decrease':
        if (currency.globalStock < amount) {
          throw new Error(
            'Stock global insuficiente para realizar esta operación',
          );
        }
        currency.globalStock -= amount;
        break;
      case 'set':
        currency.globalStock = amount;
        break;
    }

    await currency.save();
  }

  async findByCode(code: string): Promise<Currency | null> {
    return this.currencyModel.findOne({ code }).exec();
  }
}
