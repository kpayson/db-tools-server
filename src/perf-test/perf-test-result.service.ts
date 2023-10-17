import { Injectable, Inject } from '@nestjs/common';
import { PerfTestResult } from './perf-test-result.entity';
import { PERF_TEST_RESULT_REPOSITORY, PerfTestResultProviders } from './perf-test-result.providers';


@Injectable()
export class PerfTestResultService {
  constructor(
    @Inject(PERF_TEST_RESULT_REPOSITORY)
    private perfTestResult: typeof PerfTestResult
  ) {}

  async findAll(): Promise<PerfTestResult[]> {
    return this.perfTestResult.findAll<PerfTestResult>()
  }

  // async create(perfTestResult:PerfTestResult) {
  //   this.perfTestResult.create(perfTestResult)
  // }

//   const res = await this.databaseConnection.create({ 
//     name: connection.name, 
//     host: connection.host, 
//     port: connection.port, 
//     database: connection.database,
//     username: connection.username,
//     password: connection.password
// });
// return res;

  // async create() {
  //   this.perfTestResult.create(value)
  // }
}