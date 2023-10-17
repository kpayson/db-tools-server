import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ timestamps: false })
export class PerfTestResult extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  connectionId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  vus: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  runDate: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  comment: string;

  @Column({
    type: DataType.BLOB,
    allowNull: false
  })
  htmlReport: string;
}
