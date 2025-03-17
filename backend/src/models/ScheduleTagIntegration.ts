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
  Default,
  BelongsToMany
} from "sequelize-typescript";

import Company from "./Company";
import Tag from "./Tag";
import QueueIntegrations from "./QueueIntegrations";
import Whatsapp from "./Whatsapp";
import ScheduleTagIntegrationWhatsapp from "./ScheduleTagIntegrationWhatsapp";

@Table
class ScheduleTagIntegration extends Model<ScheduleTagIntegration> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Tag)
  @Column
  tagId: number;

  @BelongsTo(() => Tag, { as: 'tag', foreignKey: 'tagId' })
  tag: Tag;

  @ForeignKey(() => Tag)
  @Column
  nextTagId: number;

  @BelongsTo(() => Tag, { as: 'nextTag', foreignKey: 'nextTagId' })
  nextTag: Tag;

  @ForeignKey(() => QueueIntegrations)
  @Column
  queueIntegrationId: number;

  @BelongsTo(() => QueueIntegrations)
  queueIntegration: QueueIntegrations;

  @Column
  delay: number;

  @BelongsToMany(() => Whatsapp, () => ScheduleTagIntegrationWhatsapp)
  whatsapps: Whatsapp[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default ScheduleTagIntegration;
