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
        'Error creating currency: ' + error.message,
      );
    }
  }

  async findAll(): Promise<Currency[]> {
    try {
      return await this.currencyModel.find().exec();
    } catch (error) {
      throw new BadRequestException(
        'Error fetching currencies: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<Currency> {
    const currency = await this.currencyModel.findById(id).exec();
    if (!currency) {
      throw new NotFoundException(`Currency with ID ${id} not found`);
    }
    return currency;
  }

  async update(id: string, currencyData: Partial<Currency>): Promise<Currency> {
    const updatedCurrency = await this.currencyModel
      .findByIdAndUpdate(id, currencyData, { new: true })
      .exec();

    if (!updatedCurrency) {
      throw new NotFoundException(`Currency with ID ${id} not found`);
    }

    return updatedCurrency;
  }

  async delete(id: string): Promise<Currency> {
    const deletedCurrency = await this.currencyModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedCurrency) {
      throw new NotFoundException(`Currency with ID ${id} not found`);
    }

    return deletedCurrency;
  }
}
