import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpException,
	Post,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}
	@UsePipes(new ValidationPipe())
	@Post('register')
	async register(@Body() dto: AuthDto) {
		const oldUser = await this.authService.findUser(dto.login);
		if (!oldUser) {
			await this.authService.createUser(dto);
		} else throw new HttpException('Уже существует юзер', 300);
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(@Body() { login, password }: AuthDto) {
		const user = await this.authService.validateUser(login, password);
		return this.authService.getJWT(user.email);
	}
	@Get('all')
	async getAll() {
		return this.authService.findAllUsers();
	}
}
