import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WordsDocument = Words & Document;

@Schema()
export class Words {
  @Prop({ required: true, type: [String] })
  initial: string[];
}

export const WordsSchema = SchemaFactory.createForClass(Words);
