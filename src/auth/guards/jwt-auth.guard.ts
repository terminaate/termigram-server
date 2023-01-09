import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '../../users/models/users.model';

export type UserRequest = Request & { user: User };

@Injectable()
class JwtAuthGuard extends AuthGuard('jwt') {}

export default JwtAuthGuard;
