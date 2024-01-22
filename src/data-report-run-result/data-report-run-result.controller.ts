import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DataReportRunResult, DATA_REPORT_RUN_RESULT_REPOSITORY } from './data-report-run-result.entity';


@Controller('data-report-run-results')
export class DataReportRunResultsController {
    constructor(
        @Inject(DATA_REPORT_RUN_RESULT_REPOSITORY)
        private dataReportRunResult: typeof DataReportRunResult
    ) { }

    @Get()
    async findCommandRunResults(): Promise<DataReportRunResult[]> {
        const res = await this.dataReportRunResult.findAll();
        return res;
    }

    @Get(':id/htmlReport')
    async findById(@Param('id') id: number): Promise<string> {
        const result = await this.dataReportRunResult.findByPk(id);
        const report = result.htmlReport.toString()
        return JSON.stringify(report);
    }
}
