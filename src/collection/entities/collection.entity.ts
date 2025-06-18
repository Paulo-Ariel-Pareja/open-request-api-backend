import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Request extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  url: string;

  @Prop({ type: Object, default: {} })
  headers: any;

  @Prop({ type: String, default: '' })
  body: string;

  @Prop({ required: true })
  bodyType: string;

  @Prop({ type: String, default: '' })
  preScript: string;

  @Prop({ type: String, default: '' })
  postScript: string;

  @Prop({
    type: String,
    default: '',
  })
  tests: string;

  @Prop({ type: Object, default: {} })
  pathVariables: any;

  @Prop({ required: true })
  collectionId: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

@Schema()
export class Collection extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [Request], default: [] })
  requests: Request[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
