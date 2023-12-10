import { Column, DataType, Model, Table, ForeignKey } from 'sequelize-typescript';
import { DataReport } from './data-report.entity';

export const DATA_REPORT_PARAMETER_REPOSITORY = "DATA_REPORT_PARAMETER_REPOSITORY";

@Table({ timestamps: false, freezeTableName: true  })
export class DataReportParameter extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      })
      id: number;

    @Column({
        type:DataType.INTEGER,
    })
    @ForeignKey(() => DataReport)
    dataReportId: number;

    @Column({
        type: DataType.STRING,
    })
    name: string;

    // @Column({
    //     type: DataType.STRING,
    // })
    // dataType: string;

    @Column({
        type: DataType.STRING,
    })
    defaultValue: string;
    

}
