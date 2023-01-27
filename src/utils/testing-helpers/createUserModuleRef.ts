import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../users/models/users.model';
import { UserToken } from '../../users/models/users-tokens.model';
import { MemoryDatabase } from './MemoryDatabase';

export const createUserModuleRef = async (memDb: MemoryDatabase) => {
  const usersModuleRef = await Test.createTestingModule({
    imports: [
      JwtModule.register({
        secretOrPrivateKey: '12o3hjasdjzxcjas2',
      }),
    ],
    providers: [
      UsersService,
      {
        provide: getModelToken(User.name),
        useValue: memDb.models[User.name],
      },
      {
        provide: getModelToken(UserToken.name),
        useValue: memDb.models[UserToken.name],
      },
    ],
    exports: [UsersService],
  }).compile();
  return usersModuleRef;
};
