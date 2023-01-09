import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema()
export class UserToken {
  @Prop({ type: String, ref: 'User', required: true })
  userId: string;

  @Prop({ type: String, required: false })
  refreshToken: string;
}

export const UserTokenSchema = SchemaFactory.createForClass(UserToken);

export type UserTokenDocument = HydratedDocument<UserToken>;

export type UserTokenModel = Model<UserTokenDocument>;
