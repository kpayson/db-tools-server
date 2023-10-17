import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { CommandTemplateParameter } from './command-template-parameter.entity';

export const COMMAND_TEMPLATE_REPOSITORY = "COMMAND_TEMPLATE_REPOSITORY";

@Table({ timestamps: false })
export class CommandTemplate extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING(4000),
    allowNull: false,

  })
  template: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  resultLocationType: 'terminal' | 'file';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  resultFilePath: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  resultFileType: 'text' | 'html'

  @HasMany(() => CommandTemplateParameter)
  parameters: CommandTemplateParameter[]
}



