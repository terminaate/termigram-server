import { AuthService } from './auth.service';
import { Test } from '@nestjs/testing';
import { User, UserSchema } from '../users/models/users.model';
import { UserToken, UserTokenSchema } from '../users/models/users-tokens.model';
import { UsersService } from '../users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { createMemoryDatabase } from '../utils/testing-helpers/createMemoryDatabase';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let memDb: Awaited<ReturnType<typeof createMemoryDatabase>>;

  beforeAll(async () => {
    memDb = await createMemoryDatabase([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: UserToken.name,
        schema: UserTokenSchema,
      },
    ]);
    const usersModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
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
    const usersService = usersModule.get<UsersService>(UsersService);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });
  afterAll(() => {
    memDb.closeDatabase();
  });
  afterEach(() => {
    memDb.clearCollections();
  });

  it('should be defined', () => {
    expect(memDb).toBeDefined();
    expect(service).toBeDefined();
  });
});
