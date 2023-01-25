import { AuthService } from './auth.service';
import { Test } from '@nestjs/testing';
import { User, UserSchema } from '../users/models/users.model';
import { UserToken, UserTokenSchema } from '../users/models/users-tokens.model';
import { UsersService } from '../users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { createMemoryDatabase } from '../utils/testing-helpers/createMemoryDatabase';
import { JwtModule } from '@nestjs/jwt';
import { AuthExceptions } from './auth.exceptions';
import { ForbiddenException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
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
    usersService = usersModule.get<UsersService>(UsersService);

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

  it('all dependencies should be defined', () => {
    expect(service).toBeDefined();
    expect(usersService).toBeDefined();
    expect(memDb).toBeDefined();
  });

  const testAuthObject = (res) => {
    expect(Object.keys(res)).toEqual(['response', 'refreshToken']);
    expect(Object.keys(res.response)).toEqual(['accessToken', 'user']);
    expect(Object.keys(res.response.user)).toEqual(['id', 'username']);
  };

  let refreshTokenMock: string;

  describe('Testing register', () => {
    it('should return a new user object(login, password)', async () => {
      const res = await service.register({
        login: 'terminaate',
        password: '12345678',
      });
      testAuthObject(res);
    });

    it('should return a new user object(login, username, password)', async () => {
      const res = await service.register({
        login: 'term666',
        username: 'termi',
        password: '12345678',
      });
      refreshTokenMock = res.refreshToken;
      testAuthObject(res);
    });

    it('should throw an error that user already exist (ApiException.UserAlreadyExist)', async () => {
      await expect(
        service.register({
          login: 'terminaate',
          password: '12345678',
        }),
      ).rejects.toThrow(AuthExceptions.UserAlreadyExist());
    });
  });

  describe('Testing login', () => {
    it('should return authorized user object', async () => {
      const res = await service.login({
        login: 'terminaate',
        password: '12345678',
      });
      testAuthObject(res);
    });

    it('should throw an error that user not exist (ApiException.WrongAuthData)', async () => {
      await expect(
        service.login({
          login: 'terminaate1',
          password: '12345678',
        }),
      ).rejects.toThrow(AuthExceptions.WrongAuthData());
    });

    it('should throw an error that password do not match (ApiException.WrongAuthData)', async () => {
      await expect(
        service.login({
          login: 'terminaate',
          password: '123456789',
        }),
      ).rejects.toThrow(AuthExceptions.WrongAuthData());
    });
  });

  describe('Testing refresh', () => {
    it('should return new auth tokens(accessToken, refreshToken)', async () => {
      const res = await service.refresh(refreshTokenMock);
      expect(Object.keys(res)).toEqual(['accessToken', 'refreshToken']);
    });

    it('should throw error that token is invalid (ForbiddenException)', async () => {
      await expect(service.refresh('asd')).rejects.toThrow(ForbiddenException);
    });

    it('should throw error that userId in token is not exist in database (ForbiddenException)', async () => {
      const { refreshToken } = await usersService.generateUserTokens('123456');
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
