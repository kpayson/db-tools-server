import { Column, DataType, Model, Table, ForeignKey } from 'sequelize-typescript';
import { CommandTemplate } from './command-template.entity';

export const COMMAND_TEMPLATE_PARAMETER_REPOSITORY = "COMMAND_TEMPLATE_PARAMETER_REPOSITORY";

@Table({ timestamps: false, freezeTableName: true  })
export class CommandTemplateParameter extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      })
      id: number;

    @Column({
        type:DataType.INTEGER,
    })
    @ForeignKey(() => CommandTemplate)
    commandTemplateId: number;

    @Column({
        type: DataType.STRING,
    })
    name: string;

    @Column({
        type: DataType.STRING,
    })
    dataType: string;

    @Column({
        type: DataType.STRING,
    })
    defaultValue: string;
    
}
