import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { CommandTemplate } from '../command-template/command-template.entity';

export const COMMAND_RUN_RESULT_REPOSITORY = "COMMAND_RUN_RESULT_REPOSITORY";

@Table({ timestamps: false, freezeTableName: true  })
export class 
CommandRunResult extends Model {
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
  @ForeignKey(() => CommandTemplate)
  commandTemplateId: number;

  @Column({
    type: DataType.STRING(4000),
    allowNull: true,
  })
  parametersJson: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  runTimeMilliseconds: number;

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

  @BelongsTo(() => CommandTemplate)
  commandTemplate: CommandTemplate;
}
