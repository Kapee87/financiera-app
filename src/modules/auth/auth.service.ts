/* eslint-disable */
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

@Injectable()
export class AuthService {
  private apiKeyEmail;
  private activationUrl;
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
    };
  }

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
