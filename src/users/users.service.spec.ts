import { AuthService } from '../auth/auth.service';
import { User, UserSchema } from './models/users.model';
import { UserToken, UserTokenSchema } from './models/users-tokens.model';
import { UsersService } from './users.service';
import { MemoryDatabase } from '../utils/testing-helpers/MemoryDatabase';
import { createUserModuleRef } from '../utils/testing-helpers/createUserModuleRef';
import { createAuthModuleRef } from '../utils/testing-helpers/createAuthModuleRef';

describe('AuthService', () => {
  let authService: AuthService;
  let service: UsersService;
  let memDb: MemoryDatabase;

  beforeAll(async () => {
    memDb = new MemoryDatabase([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: UserToken.name,
        schema: UserTokenSchema,
      },
    ]);
    const usersModuleRef = await createUserModuleRef(memDb);
    service = usersModuleRef.get<UsersService>(UsersService);
    const authModuleRef = await createAuthModuleRef(memDb);
    authService = authModuleRef.get<AuthService>(AuthService);
  });
  afterAll(() => {
    memDb.closeDatabase();
  });

  it('all dependencies should be defined', () => {
    expect(service).toBeDefined();
    expect(authService).toBeDefined();
    expect(memDb).toBeDefined();
  });
});
