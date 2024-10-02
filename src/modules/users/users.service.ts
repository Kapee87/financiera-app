/* eslint-disable */
import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Next,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { userDto } from 'src/dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EnumStatus } from 'src/utils/enums/status.enum';
import { User } from 'src/schemas/user.schema';
import { Roles } from 'src/utils/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async findAll(): Promise<User[]> {
    try {
      return this.userModel.find();
    } catch (error) {
      throw new NotFoundException('No se encontraron usuarios');
    }
  }

  async findByEmail(email: string) {
    try {
      const userFound = await this.userModel.findOne({ email });
      return userFound;
    } catch (error) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      const userFound = await this.userModel.findById(id);
      if (!userFound) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return userFound;
    } catch (error) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  async createUser(user: userDto): Promise<any> {
    const existingUser = await this.findByEmail(user.email);

    if (existingUser) {
      throw new ConflictException(
        `El usuario con el correo electrónico ${user.email} ya existe`,
      );
    }
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = new this.userModel({
        ...user,
        password: hashedPassword,
        isActive: user.isActive || false,
      });
      const userCreated = await this.userModel.create(newUser);
      return userCreated;
    } catch (error) {
      throw new ConflictException(
        'No se pudo crear el usuario: ' + error.message,
      );
    }
  }

  async updateUser(id: string, user: Partial<userDto>): Promise<User> {
    try {
      return this.userModel.findByIdAndUpdate(id, user, { new: true });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      console.log('Usuario no encontrado');
      return 'Usuario no encontrado';
    } else if (user.role === Roles.Admin || user.role === Roles.SuperAdmin) {
      throw new ForbiddenException(
        'No se puede eliminar este usuario con los permisos actuales',
      );
    } else {
      console.log('Usuario eliminado exitosamente'); // Consider returning a success message instead of logging.
      await this.userModel.findByIdAndDelete(id);
      return 'Usuario eliminado exitosamente';
    }
  }
  async deleteAdmin(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) {
      console.log('Usuario no encontrado');
      return 'Usuario no encontrado';
    } else {
      console.log('Usuario eliminado exitosamente'); // Consider returning a success message instead of logging.
      return 'Usuario eliminado exitosamente';
    }
  }

  //Delete all sólo para desarrollo
  async deleteAll(): Promise<any> {
    try {
      return this.userModel.deleteMany();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
