/* eslint-disable*/
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
@UseGuards(IsActiveGuard, JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('id/:id')
  findOneById(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Post('/')
  @UseGuards(AdminGuard)
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

  @Put('update-user/:id')
  @UseGuards(AdminGuard, SuperAdminGuard)
  updateUser(@Param('id') id: string, @Body() user: userDto) {
    if (user.role !== Roles.User) {
      throw new ConflictException('Sin permiso para modificar este usuario');
    }
    return this.usersService.updateUser(id, user);
  }

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

  @Delete('delete-admin/:id')
  @UseGuards(SuperAdminGuard)
  deleteAdmin(@Param('id') id: string) {
    return this.usersService.deleteAdmin(id);
  }

  @Delete('delete-user/:id')
  @UseGuards(AdminGuard, SuperAdminGuard)
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Delete('deleteAll')
  @UseGuards(SuperAdminGuard)
  deleteAll() {
    return this.usersService.deleteAll();
  }
}
