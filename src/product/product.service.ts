import { Injectable } from '@nestjs/common';
import { ProductDocument, ProductModel } from './product.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductDto } from './dto/find-product.dto';
import { ReviewModel } from '../review/review.model';

@Injectable()
export class ProductService {
	constructor(
		@InjectModel(ProductModel.name) private readonly ProductModel: Model<ProductDocument>,
	) {}

	async create(dto: CreateProductDto) {
		return this.ProductModel.create(dto);
	}

	async delete(id: string) {
		return this.ProductModel.findByIdAndDelete(id).exec();
	}

	async find(id: string) {
		return this.ProductModel.findById(id).exec();
	}

	async updateById(id: string, dto: CreateProductDto) {
		return this.ProductModel.findByIdAndUpdate(id, dto, { new: true }).exec();
	}

	async findWithReview(dto: FindProductDto) {
		return this.ProductModel.aggregate<
			Promise<ProductModel & { review: ReviewModel; reviewCount: number; reviewAvg: number }>
		>([
			{
				$match: {
					categories: dto.category,
				},
			},
			{
				$sort: {
					_id: 1,
				},
			},
			{ $limit: dto.limit },
			{
				$lookup: {
					from: 'reviewmodels',
					localField: '_id',
					foreignField: 'productId',
					as: 'review',
				},
			},
			{
				$addFields: {
					reviewCount: { $size: '$review' },
					reviewAvg: { $avg: '$review.rating' },
					reviews: {
						$function: {
							body: `function (reviews) {
								reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
								return reviews
							}`,
							args: ['$review'],
							lang: 'js',
						},
					},
				},
			},
		]).exec();
	}
}
