import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';

@Controller('environment')
export class EnvironmentController {
  constructor(private readonly enviromentService: EnvironmentService) {}

  @Post()
  create(@Body() createEnviromentDto: CreateEnvironmentDto) {
    return this.enviromentService.create(createEnviromentDto);
  }

  @Get()
  findAll() {
    return this.enviromentService.findAll();
  }

  @Get('search')
  searchCollection(@Query('q') search: string) {
    return this.enviromentService.searchEnv(search);
  }

  @Patch(':id')
  updateRequest(@Param('id') id: string, @Body() body: CreateEnvironmentDto) {
    return this.enviromentService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enviromentService.remove(id);
  }
}
