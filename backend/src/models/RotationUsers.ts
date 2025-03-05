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
class RotationUsers extends Model<RotationUsers> {
    
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    sequence: number;

    @Column
    rotationId: number;

    @Column
    userId: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default RotationUsers;