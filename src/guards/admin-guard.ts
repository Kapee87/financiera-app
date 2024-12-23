/* eslint-disable */
/**
 * Guard para autenticar a los administradores
 *
 * Este guard utiliza el middleware de autenticación por tokens (jwt)
 * y verifica si el usuario autenticado tiene el rol de administrador
 *
 * @remarks
 * Este guard se utiliza para proteger las rutas que solo pueden ser
 * accedidas por los administradores
 *
 * @example
 * @UseGuards(AdminGuard)
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
export class AdminGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Verifica si el usuario autenticado tiene el rol de administrador
   *
   * @param err error de autenticación
   * @param user usuario autenticado
   * @param info información adicional de la autenticación
   * @param context contexto de la petición
   * @returns el usuario autenticado si tiene el rol de administrador, sino
   *          lanza una excepción ForbiddenException
   */
  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || info || !user) {
      throw err || new UnauthorizedException('Token inválido');
    }

    if (user.role === Roles.Admin) {
      return user;
    }

    throw new ForbiddenException('Sin permisos para realizar esta accion');
  }
}
