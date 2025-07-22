import {
  PipeTransform,
  BadRequestException,
  Injectable,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class JsonFilePipe implements PipeTransform {
  transform(
    file: Express.Multer.File,
    metadata: ArgumentMetadata,
  ): Express.Multer.File {
    try {
      JSON.parse(file.buffer.toString());
    } catch (error) {
      throw new BadRequestException('File is not a valid JSON');
    }
    return file;
  }
}
