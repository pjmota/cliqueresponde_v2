import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey
} from "sequelize-typescript";
import User from "./User";
import Permission from "./Permission";

@Table
class UserPermission extends Model<UserPermission> {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Permission)
  @Column
  permissionId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default UserPermission;