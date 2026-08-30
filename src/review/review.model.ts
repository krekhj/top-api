import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TimeStamps } from '../common/base.schema';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ReviewModel extends TimeStamps {
	@Prop()
	name: string;
	@Prop()
	title: string;
	@Prop()
	description: string;
	@Prop()
	rating: number;
	@Prop({ type: MongooseSchema.Types.ObjectId })
	productId: Types.ObjectId;
}

export type ReviewDocument = HydratedDocument<ReviewModel>;
export const ReviewSchema = SchemaFactory.createForClass(ReviewModel);
