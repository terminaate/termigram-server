import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { createMemoryDatabase } from '../utils/testing-helpers/createMemoryDatabase';
import { User, UserSchema } from '../users/models/users.model';
import { UserToken, UserTokenSchema } from '../users/models/users-tokens.model';
import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { mockResponse } from '../utils/testing-helpers/mockResponse';

describe('AuthController', () => {
  let service: AuthService;
  let controller: AuthController;
  let usersService: UsersService;
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
      imports: [
        JwtModule.register({
          secretOrPrivateKey: 'asda123',
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
    usersService = usersModule.get<UsersService>(UsersService);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
      controllers: [AuthController],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    controller = moduleRef.get<AuthController>(AuthController);
  });
  afterAll(() => {
    memDb.closeDatabase();
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('all dependencies should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
    expect(usersService).toBeDefined();
    expect(memDb).toBeDefined();
  });

  const testCookie = async (res) => {
    const [cookieName, cookieData, cookieOptions] = res.cookie.mock.calls[0];
    expect(cookieName).toBe('refreshToken');
    expect(typeof cookieData).toBe('string');
    expect(
      Boolean(await usersService.validateRefreshToken(cookieData)),
    ).toBeTruthy();
    expect(cookieOptions).toEqual({
      httpOnly: true,
      maxAge: controller.refreshMaxAge,
      secure: true,
    });
  };

  let refreshTokenMock: string;

  describe('Testing register', () => {
    const res = mockResponse();
    it('/POST 200, should return a new user object', async () => {
      await controller.register(
        {
          login: 'terminaate',
          password: '12345678',
        },
        res,
      );
      await testCookie(res);
      refreshTokenMock = res.cookie.mock.calls[0][1];
    });
  });

  describe('Testing login', () => {
    const res = mockResponse();
    it('/POST 200, should return a new user object(login, password)', async () => {
      await controller.login(
        {
          login: 'terminaate',
          password: '12345678',
        },
        res,
      );
      await testCookie(res);
    });
  });

  describe('Testing refresh', () => {
    const res = mockResponse();
    it('/POST 200, should return updated tokens (accessToken, refreshToken)', async () => {
      await controller.refresh(
        {
          cookies: {
            refreshToken: refreshTokenMock,
          },
        } as any,
        res,
      );
      await testCookie(res);
    });
  });
});
