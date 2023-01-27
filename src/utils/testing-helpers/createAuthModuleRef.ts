import { Test } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';
import { MemoryDatabase } from './MemoryDatabase';
import { createUserModuleRef } from './createUserModuleRef';

export const createAuthModuleRef = async (memDb: MemoryDatabase) => {
  const usersModule = await createUserModuleRef(memDb);
  const usersService = usersModule.get<UsersService>(UsersService);

  return Test.createTestingModule({
    providers: [
      AuthService,
      {
        provide: UsersService,
        useValue: usersService,
      },
    ],
  }).compile();
};
