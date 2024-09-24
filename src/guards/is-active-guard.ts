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
export class IsActiveGuard {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decodedToken = await this.jwtService.decode(token.split(' ')[1]);
      const userId = decodedToken.sub;

      const user = await this.usersService.findOneById(userId);

      if (!user || !user.isActive) {
        throw new ForbiddenException('User is not active');
      }
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
