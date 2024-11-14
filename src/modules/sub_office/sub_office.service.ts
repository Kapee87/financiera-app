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
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { createSubOfficeDto } from 'src/dtos/create-subOffice.dto';
import { updateSubOfficeDto } from 'src/dtos/update-subOffice.dto';
import { SubOffice } from 'src/schemas/sub_office.schema';

@Injectable()
export class SubOfficeService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  constructor(
    @InjectModel(SubOffice.name) private sub_officeModel: Model<SubOffice>,
    @InjectConnection() private connection: Connection,
  ) {}

  private async retry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (
          error.message?.includes('Write conflict') ||
          error.message?.includes('Please retry')
        ) {
          if (attempt < this.MAX_RETRIES) {
            await new Promise((resolve) =>
              setTimeout(resolve, this.RETRY_DELAY * attempt),
            );
            continue;
          }
        }
        throw error;
      }
    }
    throw lastError;
  }

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
      return await this.sub_officeModel.create(sub_officeData);
    } catch (error) {
      if (error.code === 11000) {
        // Este es el código de error para clave duplicada en MongoDB
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        throw new ConflictException(
          `Ya existe una sucursal con ${field}: ${value}`,
        );
      }
      throw new ConflictException('Error al crear la suboficina ' + error); // Si no es un error de duplicado, lanzamos el error original
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
        select: 'name _id code',
      })
      .populate('users')
      .exec();
  }

  /**
   * Obtiene una suboficina por su ID
   *
   * Si la suboficina no existe, lanza un error de no encontrado
   *
   * @param {string | Types.ObjectId} id - ID de la suboficina a obtener
   * @returns {Promise<SubOffice>} La suboficina
   */
  async findOne(id: string | Types.ObjectId): Promise<SubOffice> {
    const subOfficeId =
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    const subOffice = await this.sub_officeModel.findById(subOfficeId).exec();
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
   * @param {string | Types.ObjectId} id - ID de la suboficina a actualizar
   * @param {Partial<updateSubOfficeDto>} sub_officeData - Datos de la suboficina a actualizar
   * @returns {Promise<SubOffice>} La suboficina actualizada
   */
  async update(
    id: string | Types.ObjectId,
    sub_officeData: Partial<updateSubOfficeDto>,
  ): Promise<SubOffice> {
    let objectId: Types.ObjectId;

    try {
      objectId = id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    } catch (error) {
      throw new BadRequestException(`ID de sucursal inválido: ${id}`);
    }
    const subOffice = await this.sub_officeModel.findById(objectId).exec();

    if (!subOffice) {
      throw new NotFoundException(`No se encontró la sucursal con ID ${id}`);
    }

    // Manejar la actualización de monedas
    if (sub_officeData.currencies && sub_officeData.currencies.length > 0) {
      const currentCurrencies = subOffice.currencies || [];

      for (const currencyData of sub_officeData.currencies) {
        const currencyId = currencyData.currency._id;
        console.log(currencyId);

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
    subOfficeId: string | Types.ObjectId,
    currencyId: string | Types.ObjectId,
    amount: number,
    operation: 'increase' | 'decrease' | 'set',
    session?: any,
  ): Promise<string> {
    if (session) {
      // Si se proporciona una sesión externa, usarla directamente
      const subOffice = await this.sub_officeModel
        .findById(subOfficeId)
        .session(session);

      if (!subOffice) {
        throw new NotFoundException(
          `No se encontró la sucursal con ID ${subOfficeId}`,
        );
      }

      const currencyObjectId =
        currencyId instanceof Types.ObjectId
          ? currencyId
          : new Types.ObjectId(currencyId);

      const currencyIndex = subOffice.currencies.findIndex(
        (c) => c.currency?.toString() === currencyObjectId.toString(),
      );

      if (currencyIndex === -1) {
        subOffice.currencies.push({
          currency: currencyObjectId,
          stock: 0,
        });
      }

      const currency =
        currencyIndex === -1
          ? subOffice.currencies[subOffice.currencies.length - 1]
          : subOffice.currencies[currencyIndex];

      switch (operation) {
        case 'increase':
          currency.stock += amount;
          break;
        case 'decrease':
          if (currency.stock < amount) {
            throw new ConflictException(
              `Stock insuficiente para realizar esta operación. Stock actual: ${currency.stock}, Cantidad requerida: ${amount}`,
            );
          }
          currency.stock -= amount;
          break;
        case 'set':
          currency.stock = amount;
          break;
      }

      await subOffice.save({ session });
      return `Stock actualizado correctamente`;
    } else {
      // Si no hay sesión externa, usar el mecanismo de reintentos con una nueva sesión
      return this.retry(async () => {
        const session = await this.connection.startSession();
        try {
          let result;
          await session.withTransaction(async () => {
            const subOffice = await this.sub_officeModel
              .findById(subOfficeId)
              .session(session);

            if (!subOffice) {
              throw new NotFoundException(
                `No se encontró la sucursal con ID ${subOfficeId}`,
              );
            }

            const currencyObjectId =
              currencyId instanceof Types.ObjectId
                ? currencyId
                : new Types.ObjectId(currencyId);

            const currencyIndex = subOffice.currencies.findIndex(
              (c) => c.currency?.toString() === currencyObjectId.toString(),
            );

            if (currencyIndex === -1) {
              subOffice.currencies.push({
                currency: currencyObjectId,
                stock: 0,
              });
            }

            const currency =
              currencyIndex === -1
                ? subOffice.currencies[subOffice.currencies.length - 1]
                : subOffice.currencies[currencyIndex];

            switch (operation) {
              case 'increase':
                currency.stock += amount;
                break;
              case 'decrease':
                if (currency.stock < amount) {
                  throw new ConflictException(
                    `Stock insuficiente para realizar esta operación. Stock actual: ${currency.stock}, Cantidad requerida: ${amount}`,
                  );
                }
                currency.stock -= amount;
                break;
              case 'set':
                currency.stock = amount;
                break;
            }

            await subOffice.save({ session });
            result = `Stock actualizado correctamente`;
          });
          return result;
        } finally {
          session.endSession();
        }
      });
    }
  }
  /**
   * Elimina una moneda de una suboficina
   *
   * Si la moneda no existe en la suboficina, lanza un error de no encontrado
   *
   * @param {string | Types.ObjectId} subOfficeId - ID de la suboficina
   * @param {string | Types.ObjectId} currencyId - ID de la moneda a eliminar
   * @returns {Promise<string>} Un mensaje de confirmación
   */
  async deleteCurrencyFromSubOffice(
    subOfficeId: string | Types.ObjectId,
    currencyId: string | Types.ObjectId,
  ): Promise<string> {
    const subOfficeObjectId =
      subOfficeId instanceof Types.ObjectId
        ? subOfficeId
        : new Types.ObjectId(subOfficeId);
    const currencyObjectId =
      currencyId instanceof Types.ObjectId
        ? currencyId
        : new Types.ObjectId(currencyId);

    const subOffice = await this.sub_officeModel.findById(subOfficeId);

    if (!subOffice) {
      throw new NotFoundException(
        `No se encontró la sucursal con ID ${subOfficeId}`,
      );
    }

    const index = subOffice.currencies.findIndex((c) => {
      console.log('c', c);
      return c.currency._id.toString() === currencyId;
    });
    console.log('index', index);

    if (index > -1) {
      try {
        subOffice.currencies.splice(index, 1);
        await subOffice.save();
        return 'Moneda eliminada correctamente';
      } catch (error) {
        throw new BadRequestException(
          `Error al eliminar la moneda con ID ${currencyId}: ${error.message}`,
        );
      }
    } else {
      throw new NotFoundException(
        `No se encontró la moneda con ID ${currencyId} en la sucursal con ID ${subOfficeId}`,
      );
    }
  }

  /**
   * Elimina una suboficina
   *
   * Si la suboficina no existe, lanza un error de no encontrado
   *
   * @param {string} id - ID de la suboficina a eliminar
   * @returns {Promise<string>} Un mensaje de confirmación
   */
  async delete(id: string | Types.ObjectId): Promise<string> {
    const sub_officeId =
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    const deletedSub_office = this.sub_officeModel
      .findByIdAndDelete(sub_officeId)
      .exec();

    if (!deletedSub_office) {
      throw new NotFoundException(`No se encontró la sucursal con ID ${id}`);
    }
    return 'Sub agencia eliminada correctamente';
  }
  /**
   * Obtiene el stock de una moneda específica en una suboficina
   *
   * @param {string | Types.ObjectId} subOfficeId - ID de la suboficina
   * @param {string | Types.ObjectId} currencyId - ID de la moneda
   * @returns {Promise<number>} El stock de la moneda en la suboficina
   */
  async getCurrencyStock(
    subOfficeId: string | Types.ObjectId,
    currencyId: string | Types.ObjectId,
  ): Promise<number> {
    const subOffice = await this.findOne(subOfficeId);

    if (!subOffice) {
      throw new NotFoundException(`SubOffice with ID ${subOfficeId} not found`);
    }

    const currencyStock = subOffice.currencies.find(
      (stock) => stock.currency.toString() === currencyId.toString(),
    );

    if (!currencyStock) {
      return 0; // Si no se encuentra stock para esta moneda, asumimos que es 0
    }
    return currencyStock.stock;
  }
}
