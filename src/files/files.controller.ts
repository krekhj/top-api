import {
	BadRequestException,
	Controller,
	HttpCode,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FileElementResponce } from './dto/files-responce.dto';
import { FilesService } from './files.service';
import sharp from 'sharp';

@Controller('files')
export class FilesController {
	constructor(private readonly fileService: FilesService) {}
	@UsePipes(ValidationPipe)
	@Post('upload')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor)
	async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<FileElementResponce[]> {
		const res = await this.fileService.saveFiles([file]);
		if (!res.length) {
			throw new BadRequestException('Не удалось сохранить файл');
		}
		return res;
	}

	convertToWebPack(file: Buffer): Promise<Buffer> {
		return sharp(file).webp().toBuffer();
	}
}
