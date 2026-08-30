import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

class ProductCharacteristic {
	@Prop()
	name: string;
	@Prop()
	value: string;
}
@Schema()
export class ProductModel {
	@Prop()
	image: string;
	@Prop()
	title: string;
	@Prop()
	price: number;
	@Prop()
	oldPrice?: number;
	@Prop()
	credit: number;
	// @Prop()
	// calculatedRating: number;
	@Prop()
	description: string;
	@Prop()
	advantages: string;
	@Prop()
	disAdvantages: string;
	@Prop([String])
	categories: string[];
	@Prop([String])
	tags: string[];
	@Prop([ProductCharacteristic])
	characteristics: ProductCharacteristic[];
}
export type ProductDocument = HydratedDocument<ProductModel>;
export const ProductSchema = SchemaFactory.createForClass(ProductModel);
