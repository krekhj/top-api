import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TimeStamps } from '../common/base.schema';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class UserModel extends TimeStamps {
	@Prop({ unique: true })
	email: string;
	@Prop()
	passwordHash: string;
}

export type UserDocument = HydratedDocument<UserModel>;
export const UserSchema = SchemaFactory.createForClass(UserModel);
