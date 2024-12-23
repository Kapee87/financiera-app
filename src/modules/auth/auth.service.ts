/* eslint-disable */
/**
 * Servicio de autenticación, para el registro y login de usuarios,
 * así como para la activación de la cuenta y el restablecimiento de la
 * contraseña.
 *
 * @since 1.0.0
 */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { userDto } from 'src/dtos/user.dto';

import { Roles } from 'src/utils/enums/roles.enum';
import { MailerService } from 'src/utils/mailer/mailer.service';
import { TemplatesService, TemplateVars } from 'src/utils/template.service';

/**
 * Clase que implementa el servicio de autenticación
 */
@Injectable()
export class AuthService {
  private apiKeyEmail;
  private activationUrl;
  /**
   * Constructor de la clase
   *
   * @param usersService - Servicio de usuarios
   * @param jwtService - Servicio de autenticación por tokens
   * @param httpService - Servicio de peticiones HTTP
   * @param configService - Servicio de configuración
   * @param mailerService - Servicio de envío de correos electrónicos
   * @param templatesService - Servicio de plantillas de correos electrónicos
   */
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
    private mailerService: MailerService,
    private templatesService: TemplatesService,
  ) {
    this.apiKeyEmail = this.configService.get<String>('EMAIL_API_KEY');
    this.activationUrl = `${this.configService.get<string>('FRONTEND_URL')}`;
  }

  /**
   * Valida las credenciales de un usuario
   *
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @returns - Un objeto con los datos del usuario si las credenciales son
   *   válidas, de lo contrario lanza una excepción
   */
  async validateUserCredentials(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('No se encontró el usuario');
    }

    const hashedPassword = user.password;
    const isValid = await bcrypt.compare(password, hashedPassword);

    if (isValid) {
      const { password, ...result } = user.toObject();
      return result;
    } else {
      throw new UnauthorizedException('Contraseña inválida');
    }
  }

  /**
   * Realiza el login de un usuario
   *
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @returns - Un objeto con el token de autenticación si el usuario
   *   existe y las credenciales son válidas, de lo contrario lanza una
   *   excepción
   */
  async login(email: string, password: string) {
    const user = await this.validateUserCredentials(email, password);

    if (!user) {
      throw new UnauthorizedException(
        'No existe el usuario o las credenciales son incorrectas',
      );
    }

    if (user.isActive === false || !user.isActive) {
      throw new UnauthorizedException('El usuario no está activado');
    }

    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  /**
   * Registra un nuevo usuario
   *
   * @param registerUserDto - Un objeto con los datos del usuario a registrar
   * @returns - Un objeto con un mensaje de confirmación si el usuario
   *   se registró correctamente, de lo contrario lanza una excepción
   */
  async register(registerUserDto: userDto) {
    const user = await this.usersService.findByEmail(registerUserDto.email);

    if (user) {
      throw new UnauthorizedException('El email ya existe');
    }
    const mailExists = await this.checkIfMailExists(registerUserDto.email);

    if (!mailExists) {
      throw new UnauthorizedException({
        message: 'El email no existe, por favor indica uno correctamente',
      });
    }
    try {
      const newUser = await this.usersService.createUser({
        ...registerUserDto,
        role: Roles.Admin,
        isActive: false,
      });
      // Genera un token JWT para la activación
      const payload = {
        email: newUser.email,
        sub: newUser._id,
        action: 'activate',
      };
      const activationToken = this.jwtService.sign(payload, {
        expiresIn: '5h',
      }); // Token válido por 5 horas

      const link = `${this.activationUrl}?token=${activationToken}`;

      const vars: TemplateVars = {
        link,
        currentYear: new Date().getFullYear(),
        message: `¡Hola ${newUser?.email}! Por favor, activa tu cuenta haciendo clic en el siguiente enlace:`,
        title: 'Activación de cuenta',
        btn_text: 'Activar cuenta',
      };

      const html = this.templatesService.getTemplate(vars);
      try {
        await this.mailerService.sendMail({
          from: { name: 'Contable Soft', address: 'noreply@csoft.com' },
          recipients: [{ name: newUser.email, address: newUser.email }],
          subject: 'Activación de tu cuenta',
          html,
          to: newUser.email,
        });
      } catch (error) {
        throw new ConflictException(
          'Error al enviar correo electrónico de activación de cuenta',
        );
      }

      return {
        message:
          'Usuario registrado. Verifica tu correo para activar tu cuenta.',
      };
    } catch (error) {
      throw new ConflictException('Error al registrar usuario' + error.message);
    }
  }

  /**
   * Envía un correo electrónico para restablecer la contraseña de un usuario
   *
   * @param email - Correo electrónico del usuario
   * @param link - Enlace de restablecimiento de contraseña
   * @returns - Un objeto vacío si el correo electrónico se envió
   *   correctamente, de lo contrario lanza una excepción
   */
  async sendResetPasswordEmail(email: string, link: string) {
    try {
      const vars: TemplateVars = {
        link,
        currentYear: new Date().getFullYear(),
        message: `¡Hola! Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:`,
        title: 'Restablecimiento de contraseña',
        btn_text: 'Restablecer contraseña',
      };

      const html = this.templatesService.getTemplate(vars);
      await this.mailerService.sendMail({
        from: { name: 'Contable Soft', address: 'noreply@csoft.com' },
        recipients: [{ name: email, address: email }],
        subject: 'Restablecimiento de contraseña',
        html,
        to: email,
      });
    } catch (error) {
      throw new ConflictException(
        'Error al enviar correo electrónico de restablecimiento de contraseña',
      );
    }
  }

  /**
   * Verifica si un correo electrónico existe
   *
   * @param email - Correo electrónico a verificar
   * @returns - Un booleano que indica si el correo electrónico existe o no
   */
  async checkIfMailExists(email) {
    try {
      const response = await this.httpService
        .get(
          `https://emailvalidation.abstractapi.com/v1/?api_key=${this.apiKeyEmail}&email=${email}`,
        )
        .toPromise();

      if (
        response.data.deliverability === 'DELIVERABLE' &&
        response.data.quality_score > 0.9
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.error('Excediste la cuota de solicitudes. Intenta más tarde.');
        throw new ConflictException(
          'Excediste la cuota de solicitudes. Intenta más tarde.',
        );
      }
      throw new ConflictException('Error al comprobar el correo');
    }
  }

  /**
   * Crea un super administrador
   *
   * @param registerUserDto - Un objeto con los datos del super administrador
   * @returns - Un objeto con los datos del super administrador si se
   *   creó correctamente, de lo contrario lanza una excepción
   */
  async createSuperAdmin(registerUserDto: userDto) {
    const superAdmin = await this.usersService.findByEmail(
      registerUserDto.email,
    );

    if (!superAdmin) {
      await this.usersService.createUser({
        ...registerUserDto,
        role: Roles.SuperAdmin,
        isActive: true,
      });
    } else {
      throw new UnauthorizedException('El email ya existe');
    }
    return superAdmin;
  }
}
