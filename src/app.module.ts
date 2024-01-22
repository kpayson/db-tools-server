import { Module } from '@nestjs/common';
import { DBToolsController } from './dbTools.controller';
import { POOL_CONFIG } from './lib/config';
import * as config from 'config';
import { AppGateway } from 'app.gateway';
import { PerfTestService } from './perf-test/perf-test-runner.service';
import { DatabaseModule } from './database.module';
import { DatabaseConnectionController } from './database-connection/database-connection.controller';
import { CustomViewController } from './custom-view/custom-view.controller';

import { PerfTestResultController } from './perf-test/perf-test.controller';
import { CommandTemplatesController } from './command-template/command-template.controller';
import { CommandRunResultsController } from './command-run-result/command-run-results.controller';
import { DataReportController } from './data-report/data-report.controller';
import { DataReportRunResultsController } from './data-report-run-result/data-report-run-result.controller';


import { DATABASE_CONNECTION_REPOSITORY, DatabaseConnection } from './database-connection/database-connection.entity';
import { CUSTOM_VIEW_REPOSITORY, CustomView } from './custom-view/custom-view.entity';
import { CUSTOM_VIEW_PARAMETER_REPOSITORY, CustomViewParameter } from './custom-view/custom-view-parameter.entity';
import { COMMAND_TEMPLATE_REPOSITORY,CommandTemplate } from './command-template/command-template.entity';
import { COMMAND_TEMPLATE_PARAMETER_REPOSITORY, CommandTemplateParameter} from './command-template/command-template-parameter.entity';
import  { DATA_REPORT_REPOSITORY, DataReport } from './data-report/data-report.entity';
import { DATA_REPORT_PARAMETER_REPOSITORY, DataReportParameter } from './data-report/data-report-parameter.entity';
import { DATA_REPORT_RUN_RESULT_REPOSITORY, DataReportRunResult } from './data-report-run-result/data-report-run-result.entity';

import { PerfTestResultProviders } from './perf-test/perf-test-result.providers';
import { COMMAND_RUN_RESULT_REPOSITORY,CommandRunResult } from './command-run-result/command-run-result.entity';
//import { AuthApiModule } from './auth-api.module';
//import { AuthModule } from './auth/auth.module';
//import { AuthApiService } from './auth-api.service';
import { SETTING_OPTIONS } from './common/shared/constants';
import { JwtService } from '@nestjs/jwt';
import { SqlParserService } from './sql-parser/sql-parser.service';
// import { CacheModule } from '@nestjs/cache-manager';





// "auth": {
//   "clientSecret":"91c4bd0e-b242-43df-a9f1-bd256aac5a39",
//   "issuer":"http://localhost:70007"
// }

// const issuer = config.get<string>("auth.issuer");
// const audience = config.get<string>("auth.audience");
// const jwksUri = config.get<string>("auth.jwksUri");
// const idTokenUrl = config.get<string>("auth.idTokenUrl");
@Module({
  imports: [
    DatabaseModule,  
    // CacheModule.register(),   
    // AuthApiModule.forRoot({
    //   scope: '',
    //   audience: audience,
    //   issuer: issuer,
    //   jwksUri: jwksUri,
    //   idTokenUrl: idTokenUrl,
    //   jwksCache: true,
    //   jwksRateLimit: true,
    //   jwksRequestPerTime: 5,
    //   separator: ' ',
    // }),
], //, AuthModule
  controllers: [
    DBToolsController, 
    DatabaseConnectionController,
    CustomViewController, 
    PerfTestResultController, 
    CommandTemplatesController,
    CommandRunResultsController,
    DataReportRunResultsController,
    DataReportController  ],
  providers: [
    AppGateway,
    //AuthApiService,
    {provide: SETTING_OPTIONS,useValue: {}},
    {provide:POOL_CONFIG, useFactory: ()=>config.get("poolConfig")},
    {provide:DATABASE_CONNECTION_REPOSITORY, useValue: DatabaseConnection},
    {provide:CUSTOM_VIEW_REPOSITORY, useValue: CustomView},
    {provide: CUSTOM_VIEW_PARAMETER_REPOSITORY, useValue: CustomViewParameter},
    {provide:COMMAND_TEMPLATE_REPOSITORY, useValue: CommandTemplate},
    {provide:COMMAND_TEMPLATE_PARAMETER_REPOSITORY, useValue: CommandTemplateParameter},
    {provide:COMMAND_RUN_RESULT_REPOSITORY, useValue: CommandRunResult},
    {provide:DATA_REPORT_REPOSITORY, useValue: DataReport},
    {provide:DATA_REPORT_PARAMETER_REPOSITORY, useValue: DataReportParameter},
    {provide:DATA_REPORT_RUN_RESULT_REPOSITORY, useValue:DataReportRunResult},
    ...PerfTestResultProviders,
    PerfTestService,
    JwtService,
    SqlParserService
  ],
})
export class AppModule {}
