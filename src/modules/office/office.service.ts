/* eslint-disable */
/**
 * Servicio para la gestión de oficinas
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar oficinas
 *
  Juan Carlos Gonzalez Ibarra
 * @since 2022-03-04
 */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOfficeDto } from 'src/dtos/create-office.dto';
import { UpdateOfficeDto } from 'src/dtos/update-office.dto';
import { Office } from 'src/schemas/office.schema';
import { SubOfficeService } from '../sub_office/sub_office.service';
import { CurrencyService } from '../currency/currency.service';

/**
 * Clase que representa el servicio de oficinas
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar oficinas
 *
  Juan Carlos Gonzalez Ibarra
 * @since 2022-03-04
 */
@Injectable()
export class OfficeService {
  /**
   * Constructor del servicio de oficinas
   *
   * Inyecta el modelo de oficinas
   *
   * @param officeModel Modelo de oficinas
   *
   * @param subOfficeService Servicio de sub oficinas
   *
   * @param currencyService Servicio de monedas
   *
   */
  constructor(
    @InjectModel(Office.name) private officeModel: Model<Office>,
    private subOfficeService: SubOfficeService,
    private currencyService: CurrencyService,
  ) {}

  /**
   * Crea una nueva oficina
   *
   * Recibe los datos de la oficina a crear
   *
   * @param officeData Datos de la oficina a crear
   * @returns La oficina creada
   */
  async create(officeData: Partial<CreateOfficeDto>): Promise<Office> {
    try {
      const office = new this.officeModel(officeData);
      return await office.save();
    } catch (error) {
      throw new ConflictException(
        `Error al crear la oficina: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene todas las oficinas
   *
   * @returns Un arreglo de oficinas
   */
  async findAll(): Promise<Office[]> {
    try {
      return await this.officeModel.find().exec();
    } catch (error) {
      throw new ConflictException(
        `Error al obtener las oficinas: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene una oficina por su id
   *
   * @param id Identificador de la oficina a obtener
   * @returns La oficina obtenida
   */
  async findOne(id: string): Promise<Office> {
    try {
      return await this.officeModel.findById(id).exec();
    } catch (error) {
      throw new ConflictException(
        `Error al obtener la oficina con id ${id}: ${error.message}`,
      );
    }
  }

  /**
   * Actualiza una oficina
   *
   * Recibe el id de la oficina a actualizar y los datos a actualizar
   *
   * @param id Identificador de la oficina a actualizar
   * @param officeData Datos a actualizar
   * @returns La oficina actualizada
   */
  async update(
    id: string,
    officeData: Partial<UpdateOfficeDto>,
  ): Promise<Office> {
    try {
      const office = await this.officeModel
        .findByIdAndUpdate(id, officeData, { new: true })
        .exec();
      if (!office) {
        throw new NotFoundException(`No se encontró la oficina con id ${id}`);
      }
      return office;
    } catch (error) {
      throw new ConflictException(
        `Error al actualizar la oficina con id ${id}: ${error.message}`,
      );
    }
  }

  /**
   * Elimina una oficina
   *
   * Recibe el id de la oficina a eliminar
   *
   * @param id Identificador de la oficina a eliminar
   * @returns La oficina eliminada
   */
  async delete(id: string): Promise<Office> {
    try {
      return await this.officeModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new ConflictException(
        `Error al eliminar la oficina con id ${id}: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene el stock total de cada moneda en todas las sucursales de esta oficina
   *
   * @param id Identificador de la oficina
   * @returns Un objeto con los stocks de cada moneda en todas las sucursales
   */
  async getStocks(id: string): Promise<{ [currencyName: string]: number }> {
    console.log('entra al service');

    const office = await this.officeModel.findById(id).exec();
    if (!office) {
      throw new NotFoundException(`No se encontró la oficina con id ${id}`);
    }
    console.log('office encontrado: ' + office);
    try {
      if (!office) {
        throw new NotFoundException(`No se encontró la oficina con id ${id}`);
      }
      if (!office.sub_offices || office.sub_offices.length === 0) {
        throw new NotFoundException(
          `La oficina con id ${id} no tiene suboficinas`,
        );
      }
      const subOfficeIds = office.sub_offices;
      const currencies: { [currencyName: string]: number } = {};
      for (const subOfficeId of subOfficeIds) {
        const subOffice = await this.subOfficeService.findOne(subOfficeId);
        if (!subOffice) {
          throw new NotFoundException(
            `No se encontró la suboficina con id ${subOfficeId}`,
          );
        }
        if (!subOffice.currencies || subOffice.currencies.length === 0) {
          throw new NotFoundException(
            `La suboficina con id ${subOfficeId} no tiene monedas`,
          );
        }
        for (const { currency, stock } of subOffice.currencies) {
          const currencyObj = await this.currencyService.findOne(
            currency.toString(),
          );
          if (!currencyObj) {
            throw new NotFoundException(
              `No se encontró la moneda con id ${currency}`,
            );
          }
          if (currencies[currencyObj.name]) {
            currencies[currencyObj.name] += stock;
          } else {
            currencies[currencyObj.name] = stock;
          }
        }
      }
      return currencies;
    } catch (error) {
      throw new ConflictException(
        `Error al obtener los stocks de la oficina con id ${id}: ${error.message}`,
      );
    }
  }
  /**
   * Limpia las suboficinas de una oficina
   *
   * Recibe el id de la oficina que se va a limpiar
   *
   * @param id Identificador de la oficina a limpiar
   * @returns La oficina limpiada
   */
  async clearSubOffices(id: string): Promise<any> {
    try {
      const office = await this.officeModel
        .findByIdAndUpdate(id, { sub_offices: [] }, { new: true })
        .exec();
      if (!office) {
        throw new NotFoundException(`No se encontró la oficina con id ${id}`);
      }
      return { message: 'Sucursales limpiadas' };
    } catch (error) {
      throw new ConflictException(
        `Error al limpiar las suboficinas de la oficina con id ${id}: ${error.message}`,
      );
    }
  }
}
