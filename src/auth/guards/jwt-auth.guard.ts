import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserDocument } from '../../users/models/users.model';

export type UserRequest = Request & { user: UserDocument };

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
