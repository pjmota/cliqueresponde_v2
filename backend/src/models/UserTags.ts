import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey
} from "sequelize-typescript";
import Tag from "./Tag";
import User from "./User";

@Table
class UserTag extends Model<UserTag> {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Tag)
  @Column
  tagId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default UserTag;
