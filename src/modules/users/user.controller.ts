/* eslint-disable */
/**
 * Controlador de usuarios
 *
 * Este controlador se encarga de las operaciones CRUD de los usuarios
 * y de asignar roles a los mismos
 *
 * @since 1.0.0
 * @version 1.0.0
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Put,
  ConflictException,
  HttpException,
  NotFoundException,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { userDto } from 'src/dtos/user.dto';
import { SuperAdminGuard } from 'src/guards/super-admin-guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { IsActiveGuard } from 'src/guards/is-active-guard';
import { AdminGuard } from 'src/guards/admin-guard';
import { Roles } from 'src/utils/enums/roles.enum';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
// @UseGuards(IsActiveGuard, JwtAuthGuard)
export class UsersController {
  /**
   * Constructor del controlador de usuarios
   *
   * Inyecta el servicio de usuarios y el servicio de autenticación por jwt
   *
   * @param usersService - Servicio de usuarios
   * @param jwtService - Servicio de autenticación por jwt
   */
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Obtiene todos los usuarios
   *
   * @returns - Un array de usuarios
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Obtiene un usuario por su id
   *
   * @param id - Identificador del usuario
   * @returns - El usuario encontrado o null si no existe
   */
  @Get('id/:id')
  findOneById(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  /**
   * Obtiene un usuario por su email
   *
   * @param email - Email del usuario
   * @returns - El usuario encontrado o null si no existe
   */
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  /**
   * Crea un nuevo usuario
   *
   * @param body - Información del usuario a crear
   * @returns - El usuario creado
   */
  @Post('/')
  // @UseGuards(AdminGuard)
  createUser(@Body() body: userDto) {
    if (body.role === Roles.SuperAdmin) {
      throw new HttpException('No se puede crear un manager o superAdmin', 400);
    } else if (body.role === Roles.Admin) {
      throw new HttpException('No se puede crear un adminastrador', 400);
    }

    if (!Object.values(Roles).includes(body.role)) {
      throw new ConflictException('Rol no válido');
    }

    const newUser = this.usersService.createUser({ ...body, isActive: true });
    return newUser;
  }

  /**
   * Actualiza un usuario
   *
   * @param id - Identificador del usuario a actualizar
   * @param user - Información del usuario a actualizar
   * @param req - Request de la petición
   * @returns - El usuario actualizado
   */
  @Put('update-self/:id')
  async updateSelf(
    @Param('id') id: string,
    @Body() user: userDto,
    @Req() req: Express.Request & { user: any },
  ) {
    const userDB = await this.usersService.findOneById(req.user.userId);
    console.log(userDB._id.toString(), id);

    if (userDB._id.toString() !== id) {
      throw new ForbiddenException(
        'No tiene permisos para realizar esta accion',
      );
    }
    const { isActive, role, ...updateUser } = user;
    return this.usersService.updateUser(id, updateUser);
  }

  /**
   * Actualiza un usuario como administrador
   *
   * @param id - Identificador del usuario a actualizar
   * @param user - Información del usuario a actualizar
   * @returns - El usuario actualizado
   */
  @Put('update-user/:id')
  @UseGuards(AdminGuard, SuperAdminGuard)
  updateUser(@Param('id') id: string, @Body() user: userDto) {
    if (user.role !== Roles.User) {
      throw new ConflictException('Sin permiso para modificar este usuario');
    }
    return this.usersService.updateUser(id, user);
  }

  /**
   * Actualiza un usuario como administrador o super administrador
   *
   * @param id - Identificador del usuario a actualizar
   * @param user - Información del usuario a actualizar
   * @param req - Request de la petición
   * @returns - El usuario actualizado
   */
  @Put('update-admin/:id')
  @UseGuards(AdminGuard, SuperAdminGuard)
  async updateAdmin(
    @Param('id') id: string,
    @Body() user: userDto,
    @Req() req: Express.Request & { user: any },
  ) {
    const userDB = await this.usersService.findOneById(req.user.userId);

    if (userDB._id.toString() !== id && userDB.role !== Roles.SuperAdmin) {
      throw new ForbiddenException(
        'No tiene permisos para realizar esta accion',
      );
    }
    return this.usersService.updateUser(id, user);
  }

  /**
   * Elimina un usuario como administrador
   *
   * @param id - Identificador del usuario a eliminar
   * @returns - El usuario eliminado
   */
  @Delete('delete-admin/:id')
  @UseGuards(SuperAdminGuard)
  deleteAdmin(@Param('id') id: string) {
    return this.usersService.deleteAdmin(id);
  }

  /**
   * Elimina un usuario como usuario o administrador
   *
   * @param id - Identificador del usuario a eliminar
   * @returns - El usuario eliminado
   */
  @Delete('delete-user/:id')
  @UseGuards(AdminGuard, SuperAdminGuard)
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  /**
   * Elimina todos los usuarios
   *
   * @returns - El número de usuarios eliminados
   */
  @Delete('deleteAll')
  @UseGuards(SuperAdminGuard)
  deleteAll() {
    return this.usersService.deleteAll();
  }
}
