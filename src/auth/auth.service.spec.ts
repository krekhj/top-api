import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserModel } from './user.model';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
	let service: AuthService;
	const dto = {
		login: 'email@123.com',
		password: '123',
	};

	beforeEach(async () => {
		const userModelFn = jest.fn().mockImplementation((dto: AuthDto) => ({
			...dto,
			save: jest.fn().mockResolvedValue({ ...dto }),
		})) as jest.Mock & { findOne: jest.Mock };

		userModelFn.findOne = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue({ ...dto }),
		});

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					useValue: userModelFn,
					provide: getModelToken(UserModel.name),
				},
				{ provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('token') } },
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('createUser', async () => {
		const resp = await service.createUser(dto);
		expect(resp.email).toBe(dto.login);
		expect(resp.passwordHash).toBeDefined();
		expect(resp.passwordHash).not.toBe(dto.password);
	});

	it('findUser', async () => {
		const resp = await service.findUser(dto.login);
		expect(resp).not.toBeNull();
	});
});
