import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CreateRequestDto } from './dto/create-request.dto';
import { JsonFilePipe } from './pipe/json-file.pipe';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  createCollection(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionService.createCollection(createCollectionDto);
  }

  @Get()
  findAllCollections() {
    return this.collectionService.findAllCollections();
  }

  @Get('search')
  searchCollection(@Query('q') search: string) {
    return this.collectionService.searchCollection(search);
  }

  @Get(':id')
  findOneCollection(@Param('id') id: string) {
    return this.collectionService.findOneCollection(id);
  }

  @Patch(':id')
  updateCollection(@Param('id') id: string, @Body() body: CreateCollectionDto) {
    return this.collectionService.updateCollection(id, body);
  }

  @Delete(':id')
  removeCollection(@Param('id') id: string) {
    return this.collectionService.removeCollection(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('collection'))
  importFile(
    @UploadedFile(
      new JsonFilePipe()
    )
    collection: Express.Multer.File,
  ) {
    if (!collection) throw new BadRequestException('File is required');
    return this.collectionService.importFile(collection);
  }

  @Post(':id/request')
  createRequest(@Param('id') id: string, @Body() body: CreateRequestDto) {
    return this.collectionService.createRequest(id, body);
  }

  @Delete(':id/request/:request')
  removeRequest(
    @Param('id') collectionId: string,
    @Param('request') requestId: string,
  ) {
    return this.collectionService.removeRequestFromCollection(
      collectionId,
      requestId,
    );
  }

  @Patch(':id/request/:request')
  updateRequest(
    @Param('id') collectionId: string,
    @Param('request') requestId: string,
    @Body() body: CreateRequestDto,
  ) {
    return this.collectionService.updateRequest(collectionId, requestId, body);
  }
}
