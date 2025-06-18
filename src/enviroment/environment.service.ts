import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { Environment } from './entities/enviroment.entity';

@Injectable()
export class EnvironmentService {
  constructor(@InjectModel(Environment.name) private db: Model<Environment>) {}

  async create(body: CreateEnvironmentDto) {
    try {
      const created = await this.db.create(body);
      return created;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  findAll() {
    return this.db.find();
  }

  update(id: string, body: CreateEnvironmentDto) {
    return this.db.findOneAndUpdate({ _id: id }, body, { new: true });
  }

  async remove(id: string) {
    await this.db.deleteOne({ _id: id });
    return;
  }
}
