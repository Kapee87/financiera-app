/* eslint-disable */
/**
 * Controlador de autenticación, para el registro y login de usuarios,
 * así como para la activación de la cuenta y el restablecimiento de la
 * contraseña.
 *
 * @since 1.0.0
 */
import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Query,
  Delete,
  Get,
  UseGuards,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { userDto } from 'src/dtos/user.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { Roles } from 'src/utils/enums/roles.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  /**
   * Autenticación de usuarios, verifica si el email y contraseña
   * son válidos y devuelve un token JWT para la autenticación.
   *
   * @param {string} email Email del usuario
   * @param {string} password Contraseña del usuario
   * @returns {Promise<{ accessToken: string; }>} Token JWT
   */
  @Post('login')
  async login(@Body() loginUserDto: { email: string; password: string }) {
    try {
      return await this.authService.login(
        loginUserDto.email,
        loginUserDto.password,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Registro de usuarios, verifica si el email ya existe, si no,
   * crea un nuevo usuario con el rol de administrador y devuelve un
   * token JWT para la activación de la cuenta.
   *
   * @param {userDto} registerUserDto Información del usuario a registrar
   * @param {string} superKey Clave SUPER_KEY para crear super administradores
   * @returns {Promise<{ message: string; status: number; }>} Mensaje y código de estado
   */
  @Post('register')
  async register(
    @Body() registerUserDto: userDto,
    @Query('superKey') superKey: string,
  ) {
    if (!Object.values(Roles).includes(registerUserDto.role)) {
      console.log(registerUserDto);
      throw new ConflictException('Rol no válido');
    }

    if (registerUserDto.role === Roles.User) {
      throw new UnauthorizedException(
        'Sin permisos para registrar usuarios, solo Administradores',
      );
    }
    if (
      registerUserDto.role === Roles.SuperAdmin &&
      superKey !== this.configService.get<string>('SUPER_KEY')
    ) {
      throw new UnauthorizedException(
        'Solo con la clave SUPER_KEY correcta puede crear usuarios con rol de super administrador',
      );
    }

    if (
      registerUserDto.role === Roles.SuperAdmin &&
      superKey === this.configService.get<string>('SUPER_KEY')
    ) {
      try {
        await this.authService.createSuperAdmin({
          ...registerUserDto,
          isActive: false,
        });
        return {
          message: 'Creado exitosamente',
          status: 201,
        };
      } catch (error) {
        throw new UnauthorizedException(
          'No se pudo crear el super admin ' + error.message,
        );
      }
    }

    try {
      registerUserDto.role = Roles.Admin;
      return await this.authService.register(registerUserDto);
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }

  /**
   * Activa la cuenta de un usuario, verifica si el token es válido y
   * activa la cuenta del usuario.
   *
   * @param {string} token Token JWT para la activación de la cuenta
   * @returns {Promise<{ message: string; }>} Mensaje de confirmación
   */
  @Get('activate')
  async activateAccount(@Query('token') token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOneById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Token inválido');
      }

      // Activa el usuario
      user.isActive = true;
      const activeUser = await this.usersService.updateUser(user._id, user);

      return { message: 'Cuenta activada exitosamente.' };
    } catch (error) {
      throw new UnauthorizedException('Token expirado o inválido');
    }
  }

  /**
   * Envía un correo de restablecimiento de contraseña a un usuario,
   * verifica si el email existe y envía un correo con un enlace para
   * restablecer la contraseña.
   *
   * @param {string} email Email del usuario
   * @returns {Promise<{ message: string; }>} Mensaje de confirmación
   */
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid email');
      }
      const payload = {
        email: user.email,
        sub: user._id,
        action: 'forgot-password',
      };
      const token = this.jwtService.sign(payload, { expiresIn: '5m' });
      const link = `${this.configService.get<string>('FRONTEND_URL')}/change-password?token=${token}`;
      await this.authService.sendResetPasswordEmail(user.email, link);
      return {
        message:
          'Correo de restablecimiento de contraseña enviado exitosamente.',
      };
    } catch (error) {
      throw new UnauthorizedException('Email inválido o inexistente');
    }
  }

  /**
   * Restablece la contraseña de un usuario, verifica si el token es
   * válido y restablece la contraseña del usuario.
   *
   * @param {string} token Token JWT para el restablecimiento de la contraseña
   * @param {string} password Nueva contraseña del usuario
   * @returns {Promise<{ message: string; }>} Mensaje de confirmación
   */
  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body('password') password: string,
  ) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOneById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Token inválido');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      const updatedUser = await this.usersService.updateUser(user._id, user);
      return { message: 'Contraseña actualizada exitosamente.' };
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Verifica si un email ya existe en la base de datos.
   *
   * @param {string} email Email a verificar
   * @returns {Promise<boolean>} Verdadero si el email existe, falso si no
   */
  @Post('check-mail')
  async checkIfMailExists(@Body('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      return true;
    }
    return false;
  }

  //borrar db de users(SOLO DEV ENVIROMENT)
  @Delete('delete-all')
  async deleteAll(@Query('superKey') superKey: string) {
    if (superKey !== this.configService.get<string>('SUPER_KEY')) {
      throw new UnauthorizedException(
        'Solo con la clave SUPER_KEY correcta puede borrar todos los usuarios',
      );
    }
    try {
      this.usersService.deleteAll();
    } catch (error) {
      return error;
    }
    return 'Borrado exitosamente';
  }
}
