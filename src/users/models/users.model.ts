import { DataTypes } from 'sequelize';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class User {
  @ApiProperty({
    example: 'terminaate',
    description: 'The login of user account',
    required: true,
    type: String,
  })
  @Prop({ type: DataTypes.STRING, required: true })
  login: string;

  @ApiProperty({
    example: 'termi',
    description: 'The public username of user profile',
    required: false,
    type: String,
  })
  @Prop({ type: DataTypes.STRING, required: false })
  username: string;

  @ApiProperty({
    example: '12345678',
    description: 'The password of user account',
    required: true,
    type: String,
  })
  @Prop({ type: DataTypes.STRING, required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModel = Model<UserDocument>;
