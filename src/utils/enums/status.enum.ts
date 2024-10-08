/* eslint-disable */
/**
 * Enumeración para los posibles estados de una entidad.
 *
 * - `pending`: Estado de pendiente, indica que la entidad
 *   se encuentra en un estado de espera.
 * - `active`: Estado de activo, indica que la entidad
 *   se encuentra en un estado activo y listo para ser
 *   utilizado.
 * - `inactive`: Estado de inactivo, indica que la entidad
 *   se encuentra en un estado inactivo y no puede ser
 *   utilizado.
 */
export enum EnumStatus {
  Pending = 'pending',
  Active = 'active',
  Inactive = 'inactive',
}
