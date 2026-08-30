import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
	async getByEmail(email: string) {
		return this.userModel.findOne({ email });
	}
}
