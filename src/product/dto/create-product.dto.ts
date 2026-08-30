import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateProductDto {
	@IsString()
	image: string;

	@IsString()
	title: string;

	@IsNumber()
	price: number;

	@IsOptional()
	@IsNumber()
	oldPrice?: number;

	@IsNumber()
	credit: number;

	// @Prop()
	// calculatedRating: number;
	@IsString()
	description: string;

	@IsString()
	advantages: string;

	@IsString()
	disAdvantages: string;

	@IsArray()
	@IsString({ each: true })
	categories: string[];

	@IsArray()
	@IsString({ each: true })
	tags: string[];

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ProductCharacteristicDto)
	characteristics: ProductCharacteristicDto[];
}

class ProductCharacteristicDto {
	@IsString()
	name: string;

	@IsString()
	value: string;
}
