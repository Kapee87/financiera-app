/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { userDto } from 'src/dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EnumStatus } from 'src/utils/enums/status.enum';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findByEmail(email: string) {
    const userFound = await this.userModel.findOne({ email });
    return userFound;
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

  async createUser(user: userDto): Promise<User> {
    const existingUser = await this.findByEmail(user.email);

    if (existingUser) {
      throw new Error(
        `El usuario con el correo electrónico ${user.email} ya existe`,
      );
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = new this.userModel({
      ...user,
      password: hashedPassword,
      status: EnumStatus.Pending,
      isActive: false,
    });

    return newUser.save();
  }

  async updateUser(id: string, user: Partial<userDto>): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, user, { new: true });
  }

  async deleteUser(id: string) {
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
    return this.userModel.deleteMany();
  }
}
