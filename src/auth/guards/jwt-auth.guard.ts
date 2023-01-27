import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserDocument } from '../../users/models/users.model';

export type UserRequest = Request & { user: UserDocument };

@Injectable()
class JwtAuthGuard extends AuthGuard('jwt') {}

export default JwtAuthGuard;
