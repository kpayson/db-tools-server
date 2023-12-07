import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { CustomViewParameter } from './custom-view-parameter.entity';

export const CUSTOM_VIEW_REPOSITORY = "CUSTOM_VIEW_REPOSITORY";

@Table({ timestamps: false, freezeTableName: true  })
export class CustomView extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      })
      id: number;

    @Column({
        type: DataType.STRING,
    })
    name: string;

    @Column({
        type: DataType.STRING,
    })
    description: string;

    @Column({
        type: DataType.STRING,
    })
    viewSql: string;

    @HasMany(() => CustomViewParameter)
    parameters: CustomViewParameter[]
}
