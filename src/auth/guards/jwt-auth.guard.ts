import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDocument } from '../../users/models/users.model';
import { FastifyRequest } from 'fastify';

export type UserRequest = FastifyRequest & { user: UserDocument };

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
