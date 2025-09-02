/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import {
  extractBody,
  parseUrlObject,
} from './helper/collection-transform.helper';
import { PmCollection, PmItem } from './dto/import.dto';

@Injectable()
export class CollectionService {
  private readonly limitResults = 100;
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
          nameLower: { $toLower: '$name' },
        },
      },
      {
        $sort: { nameLower: 1 },
      },
      {
        $project: {
          requests: 0,
          nameLower: 0,
        },
      },
      { $limit: this.limitResults },
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
            nameLower: { $toLower: '$name' },
          },
        },
        {
          $sort: { nameLower: 1 },
        },
        {
          $project: {
            requests: 0,
            nameLower: 0,
          },
        },
        { $limit: this.limitResults },
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

  async importFile(file: Express.Multer.File) {
    let json: PmCollection;
    try {
      json = JSON.parse(file.buffer.toString());
    } catch (error) {
      throw new BadRequestException('File is not a valid JSON');
    }

    try {
      const { name, description, requests } =
        this.transformCollectionData(json);
      const newCollection = await this.createCollection({ name, description });
      const id = newCollection._id;
      const requestToCreate = requests.map((r) => {
        return {
          collectionId: id,
          ...r,
        };
      });
      await this.db.findOneAndUpdate(
        { _id: id },
        { $push: { requests: requestToCreate } },
        { new: true },
      );
      return;
    } catch (error) {
      throw new BadRequestException(
        'An unexpected error occurred while importing the file or saving it.',
      );
    }
  }

  private transformCollectionData(collection: PmCollection) {
    const postman: PmCollection = collection;
    const requests: CreateRequestDto[] = [];

    function flattenItems(items: PmItem[], parentPath: string[] = []) {
      for (const item of items) {
        if (item.item && Array.isArray(item.item)) {
          flattenItems(item.item, [...parentPath, item.name]);
        } else if (item.request) {
          console.log('item.request.url', item.request.url);
          const url =
            typeof item.request.url === 'string'
              ? item.request.url
              : parseUrlObject(item.request.url);

          const request: CreateRequestDto = {
            name: item.name,
            method: item.request.method || 'GET',
            url,
            body: extractBody(item.request),
            bodyType: item.request.body?.mode || 'raw',
            preScript: '',
            postScript: '',
            tests: '',
          };

          requests.push(request);
        }
      }
    }

    flattenItems(postman.item);

    return {
      name: postman.info.name,
      description: postman.info.description || '',
      requests,
    };
  }
}
