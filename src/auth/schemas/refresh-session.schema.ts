import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefresSessionDocument = RefresSession & Document;

@Schema()
export class RefresSession {
  @Prop({ required: true, type: String })
  userId: string;
  @Prop({ required: true, type: String })
  username: string;
  @Prop({ required: true, type: String })
  email: string;
  @Prop({ required: true, type: String })
  refreshToken: string;
  @Prop({ required: true, type: String })
  fingerprint: string;
  @Prop({ required: true, type: String })
  ip: string;
  @Prop({ required: true, type: String })
  expiresIn: string;
  @Prop({ required: true, type: String })
  createdAt: string;
}

export const RefresSessionSchema = SchemaFactory.createForClass(RefresSession);
