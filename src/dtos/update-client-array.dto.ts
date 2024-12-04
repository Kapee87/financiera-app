/* eslint-disable */
/**
 * DTO para actualizar un cliente
 *
 * Contiene los datos necesarios para actualizar un cliente
 * Permite agregar o quitar un elemento en los arrays de transacciones, movimientos u observaciones
 *
 * @property {OperationType} operation - Operación a realizar (agregar o quitar)
 * @property {ArrayType} type - Tipo de elemento a modificar (transacción, movimiento u observación)
 * @property {string | Types.ObjectId[]} elements - Elementos a agregar o quitar (ID de transacción o movimiento, o cadena de observación)
 */
import { IsEnum, IsNotEmpty, IsArray } from 'class-validator';
import { Types } from 'mongoose';

export enum OperationType {
  ADD = 'add',
  REMOVE = 'remove',
}

export enum ArrayType {
  TRANSACTIONS = 'transactions',
  MOVEMENTS = 'movements',
  OBSERVATIONS = 'observations',
}

export class UpdateClientArraysDto {
  @IsEnum(OperationType)
  @IsNotEmpty()
  operation: OperationType;

  @IsEnum(ArrayType)
  @IsNotEmpty()
  type: ArrayType;

  @IsArray()
  @IsNotEmpty()
  elements: (string | Types.ObjectId)[];
}
