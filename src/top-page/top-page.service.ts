import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TopPageDocument, TopPageModel } from './top-page.model';
import { Model } from 'mongoose';
import { CreatePageDto } from './dto/create-top-page.dto';
import { TopPageDto } from './dto/fing-top-page.dto';

@Injectable()
export class TopPageService {
	constructor(
		@InjectModel(TopPageModel.name) private readonly topPageModel: Model<TopPageDocument>,
	) {}

	async create(dto: CreatePageDto) {
		const resp = await this.topPageModel.create(dto);
		if (!resp) {
			throw new BadRequestException('Не правильно введённые данные');
		}
		return resp;
	}

	async delete(id: string) {
		const resp = await this.topPageModel.findByIdAndDelete(id).exec();
		if (!resp) {
			throw new NotFoundException('Не удалось удалить');
		}
		return resp;
	}

	async find(id: string) {
		const resp = await this.topPageModel.findById(id).exec();
		if (!resp) {
			throw new NotFoundException('Не найдёно');
		}
		return resp;
	}

	async findAll() {
		const resp = await this.topPageModel.find().exec();
		if (!resp.length) {
			throw new NotFoundException('Не найдёно');
		}
		return resp;
	}

	async updateById(id: string, dto: CreatePageDto) {
		const resp = await this.topPageModel.findByIdAndUpdate(id, dto, { new: true }).exec();
		if (!resp) {
			throw new NotFoundException('Не обновлено');
		}
		return resp;
	}

	async findByAlias(alias: string) {
		const resp = await this.topPageModel.find({ alias }).exec();
		if (!resp) {
			throw new NotFoundException('Не обновлено');
		}
		return resp;
	}

	async findByCategory(firstCategory: TopPageDto) {
		return this.topPageModel.aggregate([
			{
				$match: {
					...firstCategory,
				},
			},
			{
				$group: {
					_id: {
						secondCategory: '$secondCategory',
					},
					pages: {
						$push: { alias: '$alias', title: '$title' },
					},
				},
			},
		]);
	}

	async findByText(text: string) {
		const resp = await this.topPageModel.find({ $text: { $search: text, $caseSensitive: false } });
		if (!resp) {
			throw new NotFoundException('Не обновлено');
		}
		return resp;
	}
}
