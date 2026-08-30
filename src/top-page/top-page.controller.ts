import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { TopPageDto } from './dto/fing-top-page.dto';
import { ConfigService } from '@nestjs/config';
import { CreatePageDto } from './dto/create-top-page.dto';
import { TopPageService } from './top-page.service';
import { IdValidationPipe } from '../pipes/ad-product.pipe';

@Controller('top-page')
export class TopPageController {
	constructor(
		private readonly topPageService: TopPageService,
		private readonly configService: ConfigService,
	) {
		this.configService.get('TEST');
	}
	@Post('create')
	async create(@Body() dto: CreatePageDto) {
		return this.topPageService.create(dto);
	}
	@Get(':id')
	async get(@Param('id', IdValidationPipe) id: string) {
		return this.topPageService.find(id);
	}
	@Get('byAlias/:id')
	async getByAlias(@Param('alias') alias: string) {
		return this.topPageService.findByAlias(alias);
	}
	@Delete(':id')
	async delete(@Param('id', IdValidationPipe) id: string) {
		return this.topPageService.delete(id);
	}
	@Patch(':id')
	async patch(@Param('id', IdValidationPipe) id: string, @Body() dto: CreatePageDto) {
		return this.topPageService.updateById(id, dto);
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('findByDto')
	async find(@Body() dto: TopPageDto) {
		return this.topPageService.findByCategory(dto);
	}

	@Get('textSearch/:text')
	async textSearch(@Param('text') text: string) {
		return this.topPageService.findByText(text);
	}
}
