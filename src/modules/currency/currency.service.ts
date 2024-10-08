/* eslint-disable */
/**
 * Servicio para interactuar con el modelo de Monedas
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar monedas
 *
 * @class CurrencyService
 */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency } from 'src/schemas/currency.schema';

/**
 * Constructor del servicio de monedas
 *
 * @param {Model<Currency>} currencyModel Modelo de monedas
 */
@Injectable()
export class CurrencyService {
  constructor(
    @InjectModel(Currency.name) private currencyModel: Model<Currency>,
  ) {}

  /**
   * Crea una nueva moneda
   *
   * @param {Partial<Currency>} currencyData Datos de la moneda a crear
   * @returns {Promise<Currency>} Nueva moneda creada
   */
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

  /**
   * Obtiene todas las monedas
   *
   * @returns {Promise<Currency[]>} Lista de monedas
   */
  async findAll(): Promise<Currency[]> {
    try {
      return await this.currencyModel.find().exec();
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener las monedas: ' + error.message,
      );
    }
  }

  /**
   * Obtiene una moneda por su ID
   *
   * @param {string} id ID de la moneda
   * @returns {Promise<Currency>} Moneda encontrada
   */
  async findOne(id: string): Promise<Currency> {
    const currency = await this.currencyModel.findById(id).exec();
    if (!currency) {
      throw new NotFoundException(`No se encontró la moneda con ID ${id}`);
    }
    return currency;
  }

  /**
   * Actualiza una moneda
   *
   * @param {string} id ID de la moneda
   * @param {Partial<Currency>} currencyData Datos de la moneda a actualizar
   * @returns {Promise<Currency>} Moneda actualizada
   */
  async update(id: string, currencyData: Partial<Currency>): Promise<Currency> {
    const updatedCurrency = await this.currencyModel
      .findByIdAndUpdate(id, currencyData, { new: true })
      .exec();

    if (!updatedCurrency) {
      throw new NotFoundException(`No se encontró la moneda con ID ${id}`);
    }

    return updatedCurrency;
  }

  /**
   * Elimina una moneda
   *
   * @param {string} id ID de la moneda
   * @returns {Promise<Currency>} Moneda eliminada
   */
  async delete(id: string): Promise<Currency> {
    const deletedCurrency = await this.currencyModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedCurrency) {
      throw new NotFoundException(`No es encontró la moneda con ID ${id}`);
    }

    return deletedCurrency;
  }

  /**
   * Actualiza el stock global de una moneda
   *
   * @param {string} currencyId ID de la moneda
   * @param {number} amount Cantidad a agregar o restar
   * @param {'increase' | 'decrease' | 'set'} operation Operación a realizar
   * @returns {Promise<void>}
   */
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

  /**
   * Busca una moneda por su código
   *
   * @param {string} code Código de la moneda
   * @returns {Promise<Currency | null>} Moneda encontrada o null si no existe
   */
  async findByCode(code: string): Promise<Currency | null> {
    return this.currencyModel.findOne({ code }).exec();
  }
}
