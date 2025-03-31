import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey,
  AllowNull,
  AutoIncrement
} from "sequelize-typescript";
import Ticket from "./Ticket";
import User from "./User";
import Queue from "./Queue";
import Whatsapp from "./Whatsapp";
import Contact from "./Contact";
import Rotations from "./Rotations";

@Table
class LogRoulette extends Model<LogRoulette> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column(DataType.TEXT)
  userName: string;

  @ForeignKey(() => Rotations)
  @Column
  rotationId: number;

  @Column
  sequence: number;

  @Column
  lastSequence: number;

  @Column
  companyId: number;

  @Column(DataType.TEXT)
  companyName: string;
  
  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @Column(DataType.TEXT)
  queueName: string;

  @Column
  queueRouletteActive: boolean

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @Column(DataType.TEXT)
  contactName: string;

  @AllowNull(false)
  @Column
  contactNumber: string;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @Column(DataType.TEXT)
  whatsappName: string;

  @Column(DataType.TEXT)
  origin: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default LogRoulette;
