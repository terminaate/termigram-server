import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../users/models/users.model';
import { UserToken } from '../../users/models/users-tokens.model';
import { MemoryDatabase } from './MemoryDatabase';
import { UsersController } from '../../users/users.controller';

export const createUserModuleRef = async (memDb: MemoryDatabase) => {
  return Test.createTestingModule({
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
    controllers: [UsersController],
    exports: [UsersService],
  }).compile();
};
