import { 
  Table, 
  Column, 
  CreatedAt, 
  UpdatedAt, 
  Model, 
  PrimaryKey, 
  AutoIncrement 
} from "sequelize-typescript";

@Table
class Rotations extends Model<Rotations> {
    
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column({ defaultValue: null })
    lastSequence: number;

    @Column
    queueId: number;

    @Column
    companyId: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default Rotations;
