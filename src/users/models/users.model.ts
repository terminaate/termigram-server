import { DataTypes } from 'sequelize';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema()
export class User {
  @Prop({ type: DataTypes.STRING, required: true })
  login: string;

  @Prop({ type: DataTypes.STRING, required: false })
  username: string;

  @Prop({ type: DataTypes.STRING, required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModel = Model<UserDocument>;
