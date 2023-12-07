import { Column, DataType, Model, Table, ForeignKey } from 'sequelize-typescript';
import { CustomView } from './custom-view.entity';

export const CUSTOM_VIEW_PARAMETER_REPOSITORY = "CUSTOM_VIEW_PARAMETER_REPOSITORY";

@Table({ timestamps: false, freezeTableName: true  })
export class CustomViewParameter extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      })
      id: number;

    @Column({
        type:DataType.INTEGER,
    })
    @ForeignKey(() => CustomView)
    customViewId: number;

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
