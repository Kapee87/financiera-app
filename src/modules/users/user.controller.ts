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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { userDto } from 'src/dtos/user.dto';
import { SuperAdminGuard } from 'src/guards/super-admin-guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { IsActiveGuard } from 'src/guards/is-active-guard';
import { AdminGuard } from 'src/guards/admin-guard';
import { Roles } from 'src/utils/enums/roles.enum';

@Controller('users')
@UseGuards(IsActiveGuard, JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

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

  @Put(':id')
  async update(@Param('id') id: string, @Body() user: userDto) {
    return this.usersService.updateUser(id, user);
  }

  @Delete('deleteAdmin/:id')
  @UseGuards(SuperAdminGuard)
  deleteAdmin(@Param('id') id: string) {
    return this.usersService.deleteAdmin(id);
  }

  @Delete('deleteUser/:id')
  @UseGuards(AdminGuard)
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
