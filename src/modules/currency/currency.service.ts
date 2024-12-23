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
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Currency } from 'src/schemas/currency.schema';
import { SubOfficeService } from '../sub_office/sub_office.service';
import {
  UpdateManyCurrenciesDto,
  UpdateManyCurrenciesItem,
} from 'src/dtos/update-many-currencies.dto';
import { SubOfficeDocument } from 'src/schemas/sub_office.schema';

/**
 * Constructor del servicio de monedas
 *
 * @param {Model<Currency>} currencyModel Modelo de monedas
 */
@Injectable()
export class CurrencyService {
  /**
   * Constructor del servicio de monedas
   *
   * @param {Model<Currency>} currencyModel Modelo de monedas
   */
  constructor(
    @InjectModel(Currency.name) private currencyModel: Model<Currency>,
    @Inject(forwardRef(() => SubOfficeService))
    private subOfficeService: SubOfficeService,
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
  async findOne(id: string | Types.ObjectId): Promise<Currency> {
    const currencyId =
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    const currency = await this.currencyModel.findById(currencyId).exec();
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
  async update(
    id: string | Types.ObjectId,
    currencyData: Partial<Currency>,
  ): Promise<Currency> {
    try {
      const currencyId = typeof id === 'string' ? new Types.ObjectId(id) : id;
      if (currencyData.isPrimaryCurrency) {
        await this.currencyModel.updateMany(
          {
            isPrimaryCurrency: true,
            _id: { $ne: id },
          },
          { $set: { isPrimaryCurrency: false } }, // Desmarcar otras monedas
        );
      }
      const updatedCurrency = await this.currencyModel
        .findByIdAndUpdate(currencyId, currencyData, { new: true })
        .exec();

      if (!updatedCurrency) {
        throw new NotFoundException(`No se encontró la moneda con ID ${id}`);
      }

      return updatedCurrency;
    } catch (error) {
      if (error instanceof Error && error.name === 'BSONError') {
        throw new BadRequestException(
          `ID inválido: ${id}. Debe ser un ID de MongoDB válido`,
        );
      }
      throw error;
    }
  }

  /**
   * Actualiza varios campos de varias monedas
   *
   * @param {{ [currencyId: string]: Partial<Currency> }} currencyData
   *        Un objeto con los IDs de las monedas como clave y el objeto
   *        con los datos a actualizar como valor
   * @returns {Promise<{ success: boolean, updatedCurrencies: string[], errors: string[] }>}
   *          Un objeto que indica el éxito de la operación, las monedas actualizadas,
   *          y los errores encontrados
   */
  async updateManyCurrencies(updates: UpdateManyCurrenciesItem[]): Promise<{
    success: boolean;
    updatedCurrencies: {
      id: string;
      name: string;
      code: string;
      exchangeRate: number;
      isPrimaryCurrency?: boolean;
    }[];
    errors: string[];
  }> {
    const updatedCurrencies: {
      id: string;
      name: string;
      code: string;
      exchangeRate: number;
      isPrimaryCurrency?: boolean;
    }[] = [];
    const errors: string[] = [];

    const primaryCurrencyUpdate = updates.find(
      (update) => update.isprimarycurrency === true,
    );
    console.log('primaryCurrencyUpdate', primaryCurrencyUpdate);
    console.log('updates', updates);

    if (primaryCurrencyUpdate) {
      await this.currencyModel.updateMany(
        {
          isPrimaryCurrency: true,
          _id: { $ne: primaryCurrencyUpdate.currencyId },
        },
        { $set: { isPrimaryCurrency: false } }, // Desmarcar otras monedas
      );
    }

    for (const updateItem of updates) {
      try {
        // Validar que el ID sea válido
        if (!Types.ObjectId.isValid(updateItem.currencyId)) {
          throw new Error(`ID inválido: ${updateItem.currencyId}`);
        }

        const currencyId =
          typeof updateItem.currencyId === 'string'
            ? new Types.ObjectId(updateItem.currencyId)
            : updateItem.currencyId;

        const updateData: any = {};
        if (updateItem.exchangeRate !== undefined)
          updateData.exchangeRate = updateItem.exchangeRate;
        if (updateItem.name !== undefined) updateData.name = updateItem.name;

        if (updateItem.isprimarycurrency !== undefined) {
          updateData.isPrimaryCurrency = updateItem.isprimarycurrency;
        }

        const updated = await this.currencyModel.findByIdAndUpdate(
          currencyId,
          { $set: updateData },
          { new: true },
        );

        if (!updated) {
          throw new Error(
            `Moneda no encontrada con ID: ${updateItem.currencyId}`,
          );
        }

        updatedCurrencies.push({
          id: updateItem.currencyId,
          name: updated.name,
          code: updated.code,
          exchangeRate: updated.exchangeRate,
          isPrimaryCurrency: updated.isPrimaryCurrency,
        });
      } catch (error) {
        errors.push(`${updateItem.currencyId}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      updatedCurrencies,
      errors,
    };
  }
  /**
   * Elimina una moneda
   *
   * @param {string} id ID de la moneda
   * @returns {Promise<Currency>} Moneda eliminada
   */
  async delete(id: string | Types.ObjectId): Promise<Currency> {
    const currencyId =
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);

    // Buscar y eliminar la moneda de todas las suboficinas
    const subOffices = await this.subOfficeService.findAll();
    for (const subOffice of subOffices) {
      console.log('subOffice:' + subOffice);
      console.log('currencyId:' + currencyId);

      const currencyIndex = subOffice.currencies.findIndex((c) =>
        !c.currency ? '' : c.currency.toString() === currencyId.toString(),
      );
      if (currencyIndex > -1) {
        subOffice.currencies.splice(currencyIndex, 1);
        await (subOffice as SubOfficeDocument).save();
      }
    }

    const deletedCurrency = await this.currencyModel
      .findByIdAndDelete(currencyId)
      .exec();

    if (!deletedCurrency) {
      throw new NotFoundException(`No se encontró la moneda con ID ${id}`);
    }
    await this.subOfficeService.cleanNullCurrencies();

    return deletedCurrency;
  }

  /**
   * Obtiene una moneda por su código
   *
   * @param {string} code Código de la moneda
   * @returns {Promise<Currency>} Moneda encontrada
   */
  async findByCode(code: string): Promise<Currency> {
    const currency = await this.currencyModel.findOne({ code }).exec();
    if (!currency) {
      throw new NotFoundException(`Currency with code ${code} not found`);
    }
    return currency;
  }

  /**
   * Obtiene la tasa de cambio entre dos monedas
   *
   * @param {string} fromCurrency Código de la moneda origen
   * @param {string} toCurrency Código de la moneda destino
   * @returns {Promise<number>} Tasa de cambio entre las dos monedas
   */
  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const sourceCurrency = await this.findByCode(fromCurrency);
    const targetCurrency = await this.findByCode(toCurrency);

    if (!sourceCurrency || !targetCurrency) {
      throw new NotFoundException('One or both currencies not found');
    }

    // Asumimos que las tasas están almacenadas en relación al ARS
    const sourceRate = sourceCurrency.exchangeRate;
    const targetRate = targetCurrency.exchangeRate;

    // Calculamos la tasa cruzada
    return sourceRate / targetRate;
  }
  async getSubOfficeCurrenciesWithExchangeRate(
    subOfficeId: string | Types.ObjectId,
  ) {
    const subOffice = await this.subOfficeService.findOne(subOfficeId);

    const currencies = await Promise.all(
      subOffice.currencies.map(async (currency) => {
        const currencyDetails = await this.findOne(currency.currency);

        const exchangeRate = await this.getExchangeRate(
          currencyDetails.code,
          'ARS',
        );

        return {
          code: currencyDetails.code,
          exchangeRate: exchangeRate,
        };
      }),
    );

    return currencies;
  }
}
