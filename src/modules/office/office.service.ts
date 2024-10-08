/* eslint-disable */
/**
 * Servicio para la gestión de oficinas
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar oficinas
 *
  Juan Carlos Gonzalez Ibarra
 * @since 2022-03-04
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOfficeDto } from 'src/dtos/create-office.dto';
import { UpdateOfficeDto } from 'src/dtos/update-office.dto';
import { Office } from 'src/schemas/office.schema';

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
   */
  constructor(@InjectModel(Office.name) private officeModel: Model<Office>) {}

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
      throw new Error(`Error al crear la oficina: ${error.message}`);
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
      throw new Error(`Error al obtener las oficinas: ${error.message}`);
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
      throw new Error(
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
      return await this.officeModel
        .findByIdAndUpdate(id, officeData, { new: true })
        .exec();
    } catch (error) {
      throw new Error(
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
      throw new Error(
        `Error al eliminar la oficina con id ${id}: ${error.message}`,
      );
    }
  }
}
