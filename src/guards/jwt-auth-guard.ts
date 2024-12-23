/* eslint-disable */
/**
 * Esta clase es un guard que se utiliza para proteger las rutas que necesitan
 * autenticación por token (jwt). Utiliza el middleware de autenticación por
 * tokens (jwt) para verificar si el usuario tiene una sesión activa.
 *
  Carlos Espinoza
 * @since 1.0.0
 * @version 1.0.0
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
