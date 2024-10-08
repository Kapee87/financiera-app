/* eslint-disable */
/**
 * Servicio para la gestión de usuarios
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar usuarios
 *
  
 * @version 1.0.0
 * @since 2020-07-20
 */
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

/**
 * Clase que implementa el servicio para la gestión de usuarios
 */
@Injectable()
export class UsersService {
  /**
   * Constructor del servicio
   *
   * Inicializa el modelo de usuario y el servicio de configuración
   *
   * @param userModel - Modelo de usuario
   * @param configService - Servicio de configuración
   */
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  /**
   * Obtener todos los usuarios
   *
   * Retorna una lista de todos los usuarios
   *
   * @returns Una lista de usuarios
   */
  async findAll(): Promise<User[]> {
    try {
      return this.userModel.find();
    } catch (error) {
      throw new NotFoundException('No se encontraron usuarios');
    }
  }

  /**
   * Obtener un usuario por su email
   *
   * Retorna el usuario encontrado o lanza una excepción si no se encontró
   *
   * @param email - Email del usuario a buscar
   * @returns El usuario encontrado
   */
  async findByEmail(email: string) {
    try {
      const userFound = await this.userModel.findOne({ email });
      return userFound;
    } catch (error) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  /**
   * Obtener un usuario por su ID
   *
   * Retorna el usuario encontrado o lanza una excepción si no se encontró
   *
   * @param id - ID del usuario a buscar
   * @returns El usuario encontrado
   */
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

  /**
   * Crear un nuevo usuario
   *
   * Crea un nuevo usuario con la información proporcionada y lo almacena en la base de datos
   *
   * @param user - Información del usuario a crear
   * @returns El usuario creado
   */
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

  /**
   * Actualizar un usuario
   *
   * Actualiza la información de un usuario existente
   *
   * @param id - ID del usuario a actualizar
   * @param user - Información del usuario a actualizar
   * @returns El usuario actualizado
   */
  async updateUser(id: string, user: Partial<userDto>): Promise<User> {
    try {
      return this.userModel.findByIdAndUpdate(id, user, { new: true });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Eliminar un usuario
   *
   * Elimina un usuario existente
   *
   * @param id - ID del usuario a eliminar
   * @returns Un mensaje de confirmación de eliminación
   */
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
  /**
   * Eliminar un usuario administrador
   *
   * Elimina un usuario administrador existente
   *
   * @param id - ID del usuario a eliminar
   * @returns Un mensaje de confirmación de eliminación
   */
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

  /**
   * Eliminar todos los usuarios (solo para desarrollo)
   *
   * Elimina todos los usuarios existentes en la base de datos
   *
   * @returns Un mensaje de confirmación de eliminación
   */
  async deleteAll(): Promise<any> {
    try {
      return this.userModel.deleteMany();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
