import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';

export const DATA_REPORT_RUN_RESULT_REPOSITORY = "DATA_REPORT_RUN_RESULT_REPOSITORY";

@Table({ timestamps: false, freezeTableName: true  })
export class 
DataReportRunResult extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(4000),
    allowNull: true,
  })
  parametersJson: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  runByUser: string;
  
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
