import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TimeStamps } from '../common/base.schema';
import { HydratedDocument } from 'mongoose';

export enum TopLevelCategory {
	Courses,
	Services,
	Books,
	Products,
}

class AdavantagesChars {
	@Prop()
	title: string;
	@Prop()
	description: string;
}

class HHChars {
	@Prop()
	count: number;
	@Prop()
	juniorSalary: number;
	@Prop()
	middleSalary: number;
	@Prop()
	seniorSalary: number;
}

@Schema({ timestamps: true })
export class TopPageModel extends TimeStamps {
	@Prop({ enum: TopLevelCategory })
	firstLevelCategory: TopLevelCategory;
	@Prop()
	secondCategory: string;
	@Prop({ unique: true })
	alias: string;
	@Prop()
	title: string;
	@Prop()
	category: string;
	@Prop(HHChars)
	hh?: HHChars;
	@Prop([AdavantagesChars])
	advantages: AdavantagesChars[];
	@Prop()
	seoText: string;
	@Prop([String])
	tags: string[];
	@Prop()
	tagsTitle: string;
}

export type TopPageDocument = HydratedDocument<TopPageModel>;
export const TopPageSchema = SchemaFactory.createForClass(TopPageModel).index({
	'$**': 'text',
});
