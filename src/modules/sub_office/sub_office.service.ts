/* eslint-disable */
/**
 * Servicio para la gestión de suboficinas
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar suboficinas
 *
  Juan Carlos Gonzalez Ibarra
 * @since 2022-03-04
 */
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

  /**
   * Crea una nueva suboficina
   *
   * Si la suboficina ya existe, lanza un error de conflicto
   *
   * @param {Partial<createSubOfficeDto>} sub_officeData - Datos de la suboficina a crear
   * @returns {Promise<SubOffice>} La suboficina creada
   */
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
      throw new ConflictException(error); // Si no es un error de duplicado, lanzamos el error original
    }
  }

  /**
   * Obtiene todas las suboficinas
   *
   * @returns {Promise<SubOffice[]>} Las suboficinas
   */
  async findAll(): Promise<SubOffice[]> {
    return this.sub_officeModel
      .find()
      .populate({
        path: 'currencies.currency',
        model: 'Currency',
        select: 'name _id code globalStock',
      })
      .populate('users')
      .exec();
  }

  /**
   * Obtiene una suboficina por su ID
   *
   * Si la suboficina no existe, lanza un error de no encontrado
   *
   * @param {string} id - ID de la suboficina a obtener
   * @returns {Promise<SubOffice>} La suboficina
   */
  async findOne(id: string): Promise<SubOffice> {
    const subOffice = await this.sub_officeModel.findById(id).exec();
    if (!subOffice) {
      throw new NotFoundException(`No se encontró la sucursal con ID ${id}`);
    }
    return subOffice;
  }

  /**
   * Actualiza una suboficina
   *
   * Si la suboficina no existe, lanza un error de no encontrado
   *
   * @param {string} id - ID de la suboficina a actualizar
   * @param {Partial<updateSubOfficeDto>} sub_officeData - Datos de la suboficina a actualizar
   * @returns {Promise<SubOffice>} La suboficina actualizada
   */
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

  /**
   * Actualiza el stock de una moneda en una suboficina
   *
   * Si la suboficina o la moneda no existen, lanza un error de no encontrado
   *
   * @param {string} subOfficeId - ID de la suboficina a actualizar
   * @param {string} currencyId - ID de la moneda a actualizar
   * @param {number} amount - Cantidad a agregar o restar al stock
   * @param {string} operation - 'increase' o 'decrease'
   * @returns {Promise<void>} No devuelve nada
   */
  async updateCurrencyStock(
    subOfficeId: string,
    currencyId: string,
    amount: number,
    operation: 'increase' | 'decrease' | 'set',
  ): Promise<void> {
    const subOffice = await this.sub_officeModel.findById(subOfficeId);

    if (!subOffice) {
      throw new NotFoundException(
        `No se encontró la sucursal con ID ${subOfficeId}`,
      );
    }

    const currencyInSubOffice = subOffice.currencies.find(
      (c) => c.currency.toString() === currencyId,
    );

    if (!currencyInSubOffice) {
      // Si la moneda no existe en la sucursal, la agregamos
      subOffice.currencies.push({
        currency: new Types.ObjectId(currencyId),
        stock: 0,
      });
    }

    const index = subOffice.currencies.findIndex(
      (c) => c.currency.toString() === currencyId,
    );

    switch (operation) {
      case 'increase':
        subOffice.currencies[index].stock += amount;
        break;
      case 'decrease':
        if (subOffice.currencies[index].stock < amount) {
          throw new ConflictException(
            'Stock insuficiente para realizar esta operación',
          );
        }
        subOffice.currencies[index].stock -= amount;
        break;
      case 'set':
        subOffice.currencies[index].stock = amount;
        break;
    }

    await subOffice.save();
  }

  /**
   * Elimina una suboficina
   *
   * Si la suboficina no existe, lanza un error de no encontrado
   *
   * @param {string} id - ID de la suboficina a eliminar
   * @returns {Promise<string>} Un mensaje de confirmación
   */
  async delete(id: string): Promise<string> {
    const deletedSub_office = this.sub_officeModel.findByIdAndDelete(id).exec();

    if (!deletedSub_office) {
      throw new NotFoundException(`No se encontró la sucursal con ID ${id}`);
    }
    return 'Sub agencia eliminada correctamente';
  }
}
