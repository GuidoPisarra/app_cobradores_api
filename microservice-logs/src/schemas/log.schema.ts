/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Log extends Document {
  @Prop({ required: true })
  microservice: string;

  @Prop({ required: true })
  action: string;

  @Prop({ type: Object })
  body: Record<string, any>;

  @Prop()
  userId?: string;

  @Prop()
  ip?: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);
