/* eslint-disable */
/**
 * Esta clase es un strategy para passport-jwt, se utiliza para la autenticación
 * de los usuarios en las peticiones.
 *
 * @see https://github.com/mikenicholson/passport-jwt
 */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Clase que extiende de PassportStrategy y que utiliza la estrategia de
 * autenticación por JWT.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor de la clase, recibe un objeto ConfigService
   * que tiene la configuración de la aplicación.
   *
   * @param configService objeto con la configuración de la aplicación.
   */
  constructor(private configService: ConfigService) {
    super({
      // Extrae el token de la cabecera de la petición.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Ignora la expiración del token.
      ignoreExpiration: false,
      // Clave secreta para la encriptación del token.
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Método que se llama una vez que el token es v lido.
   * Devuelve un objeto con los datos del usuario.
   *
   * @param payload datos del usuario.
   */
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
