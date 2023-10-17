
import { Body, Controller, Delete, Get, Param, Post, Put, Inject, Query, Res } from '@nestjs/common';
import { Response } from 'express';

import { PerfTestResult } from './perf-test-result.entity';

import { PERF_TEST_RESULT_REPOSITORY } from './perf-test-result.providers';


@Controller('perf-test-results')
export class PerfTestResultController {
  constructor(@Inject(PERF_TEST_RESULT_REPOSITORY)
  private perfTestResult: typeof PerfTestResult) {}

  @Get()
  async findAll(@Query('connectionId') connectionId: number ): Promise<Partial<PerfTestResult>[]> {
    const filter = connectionId ? {connectionId} : {};
    const res = await this.perfTestResult.findAll({where:filter});
    const cleanRes = res.map(x=>({
      id:x.id, 
      connectionId:x.connectionId,
      vus: x.vus,
      runDate: x.runDate,
      htmlReport:x.htmlReport.toString()
    }));

    return cleanRes;
  }



  @Get('htmlReport/:id')
  async findById(@Param('id') id:number): Promise<string> { // @Res() res: Response, 
    const result = await this.perfTestResult.findByPk(id);
    const report = result.htmlReport.toString()
    return JSON.stringify(report);
  }


  // @Post()
  // async create(@Body() perfTestResult: PerfTestResult): Promise<PerfTestResult> {
  //   return this.perfTestResultService.create(perfTestResult);
  // }

  // @Put(':id')
  // async update(@Param('id') id: number, @Body() perfTestResult: PerfTestResult): Promise<[number, PerfTestResult[]]> {}
}