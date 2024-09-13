/* eslint-disable */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { userDto } from 'src/dtos/user.dto';
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
    this.activationUrl = this.configService.get<String>('BASE_URL');
  }

  async validateUserCredentials(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && bcrypt.compare(password, user.password)) {
      const { password, ...result } = (user as any).toObject();
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUserCredentials(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerUserDto: userDto) {
    const user = await this.usersService.findByEmail(registerUserDto.email);
    if (user) {
      throw new UnauthorizedException('Email already exists');
    }
    const mailExists = await this.checkIfMailExists(registerUserDto.email);
    if (!mailExists) {
      throw new UnauthorizedException(
        'The email is not valid or does not exist',
      );
    }
    console.log(user, mailExists);

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    const newUser = await this.usersService.createUser({
      ...registerUserDto,
      password: hashedPassword,
    });
    // Genera un token JWT para la activación
    const payload = {
      email: newUser.email,
      sub: newUser._id,
      action: 'activate',
    };
    const activationToken = this.jwtService.sign(payload, { expiresIn: '5h' }); // Token válido por 5 horas

    const activationLink = `${this.activationUrl}/auth/activate?token=${activationToken}`;

    const vars: TemplateVars = {
      activationLink,
      currentYear: new Date().getFullYear(),
      message: `¡Hola ${newUser?.email}! Por favor, activa tu cuenta haciendo clic en el siguiente enlace:`,
    };

    const html = this.templatesService.getTemplate(vars);
    await this.mailerService.sendMail({
      from: { name: 'Contable Soft', address: 'noreply@csoft.com' },
      recipients: [{ name: newUser.email, address: newUser.email }],
      subject: 'Activación de tu cuenta',
      html,
      to: newUser.email,
    });

    return {
      message: 'Usuario registrado. Verifica tu correo para activar tu cuenta.',
    };
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
        return {
          message: 'Excediste la cuota de solicitudes. Intenta más tarde.',
        };
      }
      return {
        message: error.message,
        error: error,
      };
    }
  }
}
