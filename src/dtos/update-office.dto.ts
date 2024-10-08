/* eslint-disable */
/**
 * DTO para actualizar una oficina
 *
 * Contiene los datos necesarios para actualizar una oficina
 *
 * @property {string} [name] - Nombre de la oficina (opcional)
 * @property {string} [address] - Dirección de la oficina (opcional)
 * @property {string[]} [users] - Arreglo de identificadores de los usuarios que tendrán acceso a la oficina (opcional)
 */
export class UpdateOfficeDto {
  name?: string;
  address?: string;
  users?: Array<string>;
}
