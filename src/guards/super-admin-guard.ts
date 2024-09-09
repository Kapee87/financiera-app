/* eslint-disable */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/utils/enums/roles.enum';

@Injectable()
export class SuperAdminGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || info || !user) {
      throw err || new UnauthorizedException();
    }

    if (user.role === Roles.SuperAdmin) {
      return user;
    }

    throw new ForbiddenException();
  }
}
