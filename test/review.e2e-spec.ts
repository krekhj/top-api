import { Test, TestingModule } from '@nestjs/testing';
import { Body, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { CreateReviewDto } from '../src/review/dto/create-review.dto';
import { Types } from 'mongoose';
import { AuthDto } from '../src/auth/dto/auth.dto';

const productId = new Types.ObjectId().toHexString();

const loginDto: AuthDto = {
	login: 'test@mail.ru',
	password: '123',
};

const testDto: CreateReviewDto = {
	name: 'Test',
	title: 'Заголовок',
	description: 'Описание теста',
	rating: 5,
	productId,
};

describe('Review (e2e)', () => {
	let app: INestApplication<App>;
	let createdId: string;
	let token: string;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();

		await app.init();

		const { body } = await request(app.getHttpServer()).post('/auth/login').send(loginDto);
		token = body.access_token;
	});

	it('/review/create (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/review/create')
			.send({ ...testDto, rating: 0 })
			.expect(400)
			.then(({ body }: request.Response) => {
				console.log(body);
			});
	});

	it('/review/create (POST) - fail', async () => {
		return request(app.getHttpServer())
			.post('/review/create')
			.send(testDto)
			.expect(201)
			.then(({ body }: request.Response) => {
				createdId = body._id;
				expect(createdId).toBeDefined();
			});
	});

	it('byProduct/:productId (GET)', async () => {
		return request(app.getHttpServer())
			.get('/review/byProduct/' + productId)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.length).toBe(1);
			});
	});

	it('/review/delete (POST)', async () => {
		return request(app.getHttpServer())
			.delete(`/review/${createdId}`)
			.set('Authorization', 'Bearer ' + token)
			.expect(200);
	});

	afterEach(async () => {
		await app.close();
	});
});
