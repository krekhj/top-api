import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum TopLevelCategory {
	Courses,
	Services,
	Books,
	Products,
}

class AdvantagesChars {
	@IsString()
	title: string;
	@IsString()
	description: string;
}

class HHChars {
	@IsNumber()
	count: number;
	@IsNumber()
	juniorSalary: number;
	@IsNumber()
	middleSalary: number;
	@IsNumber()
	seniorSalary: number;
}

export class CreatePageDto {
	@IsEnum(TopLevelCategory)
	firstLevelCategory: TopLevelCategory;

	@IsString()
	secondCategory: string;

	@IsString()
	alias: string;

	@IsString()
	title: string;

	@IsString()
	category: string;

	@IsOptional()
	@ValidateNested()
	@Type(() => HHChars)
	hh?: HHChars;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => AdvantagesChars)
	advantages: AdvantagesChars[];

	@IsString()
	seoText: string;

	@IsArray()
	@IsString({ each: true })
	tags: string[];

	@IsString()
	tagsTitle: string;
}
