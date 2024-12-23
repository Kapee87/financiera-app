/* eslint-disable */
/**
 * Enumerado de roles que se pueden asignar a un usuario.
 *
 * - SuperAdmin: rol de super administrador, tiene permisos
 *   totales sobre la aplicación.
 * - Admin: rol de administrador, tiene permisos de
 *   administración sobre la aplicación.
 * - User: rol de usuario, tiene permisos de lectura y
 *   escritura sobre la aplicación.
 */
export enum Roles {
  SuperAdmin = 'manager',
  Admin = 'administrador',
  User = 'user',
}
