import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserModel } from './user.model';
import { Model } from 'mongoose';
import { AuthDto } from './dto/auth.dto';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>,
		private readonly jwtService: JwtService,
	) {}

	async createUser(dto: AuthDto): Promise<UserDocument> {
		const salt = genSaltSync(10);
		const newUser = new this.userModel({
			email: dto.login,
			passwordHash: hashSync(dto.password, salt),
		});
		return newUser.save();
	}

	async findUser(email: string): Promise<UserDocument | null> {
		return this.userModel.findOne({ email }).exec();
	}

	async validateUser(email: string, password: string): Promise<Pick<UserDocument, 'email'>> {
		const user = await this.findUser(email);
		const isCorrectPassword = compareSync(password, user?.passwordHash || '');
		if (!user) {
			throw new UnauthorizedException('Пользователь не найден');
		} else if (!isCorrectPassword) {
			throw new UnauthorizedException('Не правильный пароль');
		}

		return { email: user.email };
	}

	async findAllUsers() {
		return this.userModel.find().exec();
	}

	async getJWT(email: string) {
		const payload = { email };
		return {
			access_token: await this.jwtService.signAsync(payload),
		};
	}
}
