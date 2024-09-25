/* eslint-disable */
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
        'Sin permisos para registrar usuarios, sólo Administradores',
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
