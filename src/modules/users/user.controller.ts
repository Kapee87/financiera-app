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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { userDto } from 'src/dtos/user.dto';
import { SuperAdminGuard } from 'src/guards/super-admin-guard';

@Controller('users')
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
  createUser(@Body() body: userDto) {
    return this.usersService.createUser(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() user: userDto) {
    return this.usersService.updateUser(id, user);
  }

  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  deleteUSer(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
