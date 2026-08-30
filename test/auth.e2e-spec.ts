import { Test, TestingModule } from '@nestjs/testing';
import { Body, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto/auth.dto';

const loginDto: AuthDto = {
	login: 'test@mail.ru',
	password: '123',
};

describe('Review (e2e)', () => {
	let app: INestApplication<App>;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();

		await app.init();
	});

	it('auth/login (POST) SUCCESS', () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send(loginDto)
			.expect(200)
			.then(({ body }: request.Response) => {
				console.log(body);
			});
	});

	it('auth/login (POST) FAIL', () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({ ...loginDto, login: 'fail' })
			.expect(401)
			.then(({ body }: request.Response) => {
				console.log(body);
			});
	});

	afterEach(async () => {
		await app.close();
	});
});
