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
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { userDto } from 'src/dtos/user.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { Roles } from 'src/utils/enums/roles.enum';
import { IsActiveGuard } from 'src/guards/is-active-guard';

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
    if (
      registerUserDto.role === Roles.SuperAdmin &&
      superKey !== this.configService.get<string>('SUPER_KEY')
    ) {
      throw new UnauthorizedException(
        'Solo con la clave SUPER_KEY correcta puede crear usuarios con rol de super administrador',
      );
    }

    try {
      return await this.authService.register(registerUserDto);
    } catch (error) {
      return {
        message: error.message,
        status: error.status,
        name: error.name,
        error: error,
      };
    }
  }
  @Get('activate')
  async activateAccount(@Query('token') token: string) {
    console.log(token);

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOneById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Activa el usuario
      user.isActive = true;
      const activeUser = await this.usersService.updateUser(user._id, user);
      console.log(activeUser);
      return { message: 'Cuenta activada exitosamente.' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
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
      const link = `${this.configService.get<string>('BASE_URL')}/auth/reset-password?token=${token}`;
      return { link };
    } catch (error) {
      throw new UnauthorizedException('Invalid email');
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
        throw new UnauthorizedException('Invalid token');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      const updatedUser = await this.usersService.updateUser(user._id, user);
      return { message: 'Contraseña actualizada exitosamente.' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
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

  //propando guard isActive
  @Get('users')
  @UseGuards(IsActiveGuard)
  async getUsers() {
    const users = await this.usersService.findAll();
    return users;
  }
}
