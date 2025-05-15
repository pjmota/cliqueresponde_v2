import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
} from "sequelize-typescript";

import Company from "./Company";
import User from "./User";
import Tag from "./Tag";

@Table({
  tableName: "LogTransferTicketsTag"
})
class LogTransferTicketsTag extends Model<LogTransferTicketsTag> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Tag)
  @Column
  currentTagId: number;

  @BelongsTo(() => Tag)
  currentTag: Tag;
  
  @ForeignKey(() => Tag)
  @Column
  nextTagId: number;

  @BelongsTo(() => Tag)
  nextTag: Tag;

  @Column
  tickets: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
  
  @Column
  screenInfo: string;
}

export default LogTransferTicketsTag;
