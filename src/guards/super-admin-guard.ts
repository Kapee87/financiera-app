/* eslint-disable */
/**
 * Guard para proteger las rutas que solo pueden ser accedidas
 * por el super administrador
 *
 * Este guard utiliza el middleware de autenticación por tokens (jwt)
 * y verifica si el usuario autenticado tiene el rol de super administrador
 *
 * @remarks
 * Este guard se utiliza para proteger las rutas que solo pueden ser
 * accedidas por el super administrador
 *
 * @example
 * @UseGuards(SuperAdminGuard)
 * @Controller('ruta-protegida')
 */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/utils/enums/roles.enum';

@Injectable()
export class SuperAdminGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Verifica si el usuario autenticado tiene el rol de super administrador
   *
   * @param err error de autenticación
   * @param user usuario autenticado
   * @param info información adicional de la autenticación
   * @param context contexto de la petición
   * @returns el usuario autenticado si tiene el rol de super administrador, sino
   *          lanza una excepción ForbiddenException
   */
  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || info || !user) {
      throw err || new UnauthorizedException();
    }

    if (user.role === Roles.SuperAdmin) {
      return user;
    }

    throw new ForbiddenException();
  }
}
