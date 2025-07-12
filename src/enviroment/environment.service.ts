import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  searchEnv(search: string) {
    try {
      return this.db.aggregate([
        {
          $match: {
            name: { $regex: search, $options: 'i' },
          },
        },
      ]);
    } catch (error) {
      const message = error.message || 'Environment not found';
      throw new NotFoundException(message);
    }
  }

  update(id: string, body: CreateEnvironmentDto) {
    return this.db.findOneAndUpdate({ _id: id }, body, { new: true });
  }

  async remove(id: string) {
    await this.db.deleteOne({ _id: id });
    return;
  }
}
