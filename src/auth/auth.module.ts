import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from './user.model';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJWTConfig } from '../configs/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { JwtStratagy } from './strategies/jwt.stratagy';

@Module({
	controllers: [AuthController],
	imports: [
		MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJWTConfig,
		}),
		PassportModule,
		ConfigModule,
	],
	providers: [AuthService, JwtStratagy],
})
export class AuthModule {}
