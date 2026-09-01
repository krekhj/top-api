import {
	// BadRequestException,
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
import { MFile } from './dto/mfile.class';

@Controller('files')
export class FilesController {
	constructor(private readonly fileService: FilesService) {}
	@UsePipes(ValidationPipe)
	@Post('upload')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('files'))
	async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<FileElementResponce[]> {
		const saveArray: MFile[] = [file];
		if (file.mimetype.includes('image')) {
			const webp = await this.fileService.convertToWebPack(file.buffer);
			saveArray.push(
				new MFile({
					originalname: `${file.originalname.split('.')[0]}.webp`,
					buffer: webp,
				}),
			);
		}
		return this.fileService.saveFiles(saveArray);
		// if (!res.length) {
		// 	throw new BadRequestException('Не удалось сохранить файл');
		// }
		// return res;
	}
}
