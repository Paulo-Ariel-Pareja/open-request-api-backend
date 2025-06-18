import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ minimize: false })
export class Environment extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Object, default: {} })
  variables: any;

  @Prop({ type: Boolean, default: false })
  isActive: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const EnvironmentSchema = SchemaFactory.createForClass(Environment);
