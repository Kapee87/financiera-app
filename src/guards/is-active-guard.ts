/* eslint-disable */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class IsActiveGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const decodedToken = this.jwtService.verify(token.split(' ')[1]);
      const userFound = await this.usersService.findOneById(decodedToken.sub);

      if (!userFound || !userFound.isActive) {
        throw new ForbiddenException('User is not active');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
