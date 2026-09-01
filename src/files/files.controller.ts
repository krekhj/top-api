import {
	BadRequestException,
	Controller,
	HttpCode,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FileElementResponce } from './dto/files-responce.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
	constructor(private readonly fileService: FilesService) {}
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
}
