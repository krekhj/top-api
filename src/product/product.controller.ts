import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	NotFoundException,
	Param,
	Patch,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { ProductModel } from './product.model';
import { FindProductDto } from './dto/find-product.dto';
import { ProductService } from './product.service';
import { IdValidationPipe } from '../pipes/ad-product.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('product')
export class ProductController {
	constructor(private readonly productService: ProductService) {}
	@UsePipes(new ValidationPipe())
	@Post('create')
	async create(@Body() dto: Omit<ProductModel, '_id'>) {
		return this.productService.create(dto);
	}
	@Get(':id')
	async get(@Param('id', IdValidationPipe) id: string) {
		const product = await this.productService.find(id);
		if (!product) {
			throw new NotFoundException('Продукт не найден');
		} else return product;
	}
	@Delete(':id')
	async delete(@Param('id', IdValidationPipe) id: string) {
		const deletedProduct = await this.productService.delete(id);
		if (!deletedProduct) {
			throw new NotFoundException('Продукт не найден');
		}
	}
	@Patch(':id')
	async patch(@Param('id', IdValidationPipe) id: string, @Body() dto: ProductModel) {
		const patchedProduct = await this.productService.updateById(id, dto);
		if (!patchedProduct) {
			throw new NotFoundException('Продукт не обновлён');
		}
		return patchedProduct;
	}
	@UseGuards(JwtAuthGuard)
	@HttpCode(200)
	@Post('find')
	async find(@Body() dto: FindProductDto) {
		const findedProduct = await this.productService.findWithReview(dto);
		if (!findedProduct.length) {
			throw new NotFoundException('Продукт не найден');
		}
		return findedProduct;
	}
}
