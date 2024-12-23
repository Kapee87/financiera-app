/* eslint-disable */
/**
 * Este guard es utilizado para verificar si un usuario esta activo o no
 * antes de permitirle acceder a una ruta protegida.
 *
 * Utiliza el middleware de autenticación por tokens (jwt) y verifica
 * si el usuario autenticado tiene el campo "isActive" en true.
 *
 * Si el token es invalido o no existe, lanza una excepción de UnauthorizedException.
 * Si el usuario no tiene el campo "isActive" en true, lanza una excepción de ForbiddenException.
 *
 * Para utilizar este guard, solo es necesario agregarlo a la ruta que se
 * desea proteger con el decorador @UseGuards(IsActiveGuard).
 */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';

/**
 * Clase que implementa el guard para verificar si un usuario esta activo o no.
 */
@Injectable()
export class IsActiveGuard {
  /**
   * Constructor de la clase que inyecta los servicios necesarios.
   *
   * @param jwtService - Servicio de autenticación por tokens (jwt).
   * @param usersService - Servicio de usuarios.
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Verifica si el usuario esta activo o no.
   *
   * @param context - El contexto de la petición.
   * @returns - Un booleano que indica si el usuario esta activo o no.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decodedToken = await this.jwtService.decode(token.split(' ')[1]);
      const userId = decodedToken.sub;

      const user = await this.usersService.findOneById(userId);

      if (!user || !user.isActive) {
        throw new ForbiddenException('User is not active');
      }
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
