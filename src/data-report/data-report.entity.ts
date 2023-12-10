import { Column, DataType, Model, Table, HasMany, ForeignKey } from 'sequelize-typescript';
import { DataReportParameter } from './data-report-parameter.entity';
import { CustomView } from 'src/custom-view/custom-view.entity';

export const DATA_REPORT_REPOSITORY = "DATA_REPORT_REPOSITORY";

@Table({ timestamps: false, freezeTableName: true  })
export class DataReport extends Model {
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
    reportTemplate: string;

    @Column({
        type: DataType.NUMBER,
    })
    @ForeignKey(() => CustomView)
    customViewId: number;

    @HasMany(() => DataReportParameter)
    parameters: DataReportParameter[]
}
