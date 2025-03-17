import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement
} from "sequelize-typescript";

import Company from "./Company";
import ScheduleTagIntegration from "./ScheduleTagIntegration";
import Whatsapp from "./Whatsapp";

@Table({ tableName: "ScheduleTagIntegrationWhatsapp" })
class ScheduleTagIntegrationWhatsapp extends Model<ScheduleTagIntegrationWhatsapp> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => ScheduleTagIntegration)
  @Column
  scheduleTagIntegrationId: number;

  @BelongsTo(() => ScheduleTagIntegration)
  scheduleTagIntegration: ScheduleTagIntegration;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

}

export default ScheduleTagIntegrationWhatsapp;
