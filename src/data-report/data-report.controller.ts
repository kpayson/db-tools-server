import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { DataReport, DATA_REPORT_REPOSITORY } from './data-report.entity';
import { DataReportParameter } from './data-report-parameter.entity';
import { Inject } from '@nestjs/common';

@Controller('data-reports')
export class DataReportController {
    constructor(
        @Inject(DATA_REPORT_REPOSITORY)
        private dataReport: typeof DataReport) { }

    @Post()
    async create(@Body() dataReport: DataReport): Promise<DataReport> {
        const res = await this.dataReport.create({
            name: dataReport.name,
            description: dataReport.description,
            reportTemplate: dataReport.reportTemplate,
            customViewId: dataReport.customViewId,
            parameters: dataReport.parameters
        }, {
            include: [{ model: DataReportParameter, as: 'parameters' }]
        });
        return res;
    }

    @Get()
    async findAll() {
        const res = await this.dataReport.findAll({ include: [{ model: DataReportParameter, as: 'parameters' }] });
        return res;
    }

    @Get('/:id')
    async findById(@Param('id') id: number): Promise<Partial<DataReport>> {
        const res = await this.dataReport.findByPk(id, { include: [{ model: DataReportParameter, as: 'parameters' }] });
        return res;
    }


    @Put(':id')
    async update(@Param('id') id: string, @Body() dataReport: DataReport): Promise<void> {
        await this.dataReport.update(
            {
                name: dataReport.name,
                description: dataReport.description,
                reportTemplate: dataReport.reportTemplate,
                customViewId: dataReport.customViewId
            },
            {
                where: {
                    id: id
                }
            }
        );

        await DataReportParameter.destroy({where: {dataReportId: id}});

        for (const parameter of dataReport.parameters) {
            await DataReportParameter.create({
                dataReportId: id,
                name: parameter.name,
                defaultValue: parameter.defaultValue,
                //dataType: parameter.dataType,
            });
        }
    }

    @Delete(':id')
    async destroy(@Param('id') id: number): Promise<number> {
        const res = await this.dataReport.destroy({ where: { id } });
        return res;
    }


}