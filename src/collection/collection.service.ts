/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { Collection } from './entities/collection.entity';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class CollectionService {
  constructor(@InjectModel(Collection.name) private db: Model<Collection>) {}

  async createCollection(body: CreateCollectionDto) {
    try {
      const created = await this.db.create(body);
      const { requests, ...other } = created.toObject();
      return { ...other, size: 0 };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  findAllCollections() {
    return this.db.aggregate([
      {
        $addFields: {
          size: { $size: '$requests' },
        },
      },
      {
        $project: {
          requests: 0,
        },
      },
    ]);
  }

  async findOneCollection(id: string) {
    try {
      const data = await this.db.findOne({ _id: id }).exec();
      if (!data) throw new Error('Collection not found');
      return data;
    } catch (error) {
      const message = error.message || 'Collection not found';
      throw new NotFoundException(message);
    }
  }

  searchCollection(search: string) {
    try {
      return this.db.aggregate([
        {
          $match: {
            name: { $regex: search, $options: 'i' },
          },
        },
        {
          $addFields: {
            size: { $size: '$requests' },
          },
        },
        {
          $project: {
            requests: 0,
          },
        },
      ]);
    } catch (error) {
      const message = error.message || 'Collection not found';
      throw new NotFoundException(message);
    }
  }

  async removeCollection(id: string) {
    await this.db.deleteOne({ _id: id });
    return;
  }

  async updateCollection(id: string, body: CreateCollectionDto) {
    try {
      await this.findOneCollection(id);
      const data = await this.db.findOneAndUpdate(
        { _id: id },
        { ...body },
        { new: true },
      );
      if (!data) throw new BadRequestException('Collection not found');
      const { requests, ...others } = data.toObject();
      return { ...others, size: requests.length };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async createRequest(id: string, body: CreateRequestDto) {
    await this.findOneCollection(id);
    const data = { ...body, collectionId: id };
    const result = await this.db.findOneAndUpdate(
      { _id: id },
      { $push: { requests: data } },
      { new: true },
    );
    return result?.requests[result.requests.length - 1];
  }

  async removeRequestFromCollection(id: string, requestId: string) {
    const collection = await this.findOneCollection(id);
    const requestLeft = collection.requests.filter((request) => {
      if (request.id === requestId) {
        return;
      }
      return request;
    });
    return this.db.findOneAndUpdate(
      { _id: id },
      { $set: { requests: requestLeft } },
      { new: true },
    );
  }

  async updateRequest(id: string, requestId: string, body: CreateRequestDto) {
    const collection = await this.findOneCollection(id);
    let toReturn;
    const requestLeft = collection.requests.map((request) => {
      if (request.id === requestId) {
        const requestUpdated = {
          _id: request._id,
          ...body,
          collectionId: id,
          createdAt: request.createdAt,
          updatedAt: new Date(),
        };
        toReturn = requestUpdated;
        return requestUpdated;
      }
      return request;
    });
    await this.db.findOneAndUpdate(
      { _id: id },
      { $set: { requests: requestLeft } },
      { new: true },
    );
    return toReturn;
  }
}
