import { Module } from '@nestjs/common';
import { DBToolsController } from './dbTools.controller';
import { POOL_CONFIG } from './lib/config';
import * as config from 'config';
import { AppGateway } from 'app.gateway';
import { PerfTestService } from './perf-test/perf-test-runner.service';
import { DatabaseModule } from './database.module';
import { DatabaseConnectionController } from './database-connection/database-connection.controller';
import { PerfTestResultController } from './perf-test/perf-test.controller';
import { CommandTemplatesController } from './command-template/command-template.controller';
import { CommandRunResultsController } from './command-run-result/command-run-results.controller'

import { DATABASE_CONNECTION_REPOSITORY, DatabaseConnection } from './database-connection/database-connection.entity';
import { COMMAND_TEMPLATE_REPOSITORY,CommandTemplate } from './command-template/command-template.entity';
import { COMMAND_TEMPLATE_PARAMETER_REPOSITORY, CommandTemplateParameter} from './command-template/command-template-parameter.entity';

import { PerfTestResultProviders } from './perf-test/perf-test-result.providers';
import { COMMAND_RUN_RESULT_REPOSITORY,CommandRunResult } from './command-run-result/command-run-result.entity';
import { AuthApiModule } from './auth-api.module';
//import { AuthModule } from './auth/auth.module';
//import { AuthApiService } from './auth-api.service';
import { SETTING_OPTIONS } from './common/shared/constants';
import { JwtService } from '@nestjs/jwt';



// "auth": {
//   "clientSecret":"91c4bd0e-b242-43df-a9f1-bd256aac5a39",
//   "issuer":"http://localhost:70007"
// }

const issuer = config.get<string>("auth.issuer");
const audience = config.get<string>("auth.audience");
const jwksUri = config.get<string>("auth.jwksUri");
const idTokenUrl = config.get<string>("auth.idTokenUrl");
@Module({
  imports: [
    DatabaseModule,     
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
    PerfTestResultController, 
    CommandTemplatesController,
    CommandRunResultsController  ],
  providers: [
    AppGateway,
    //AuthApiService,
    {provide: SETTING_OPTIONS,useValue: {}},
    {provide:POOL_CONFIG, useFactory: ()=>config.get("poolConfig")},
    {provide:DATABASE_CONNECTION_REPOSITORY, useValue: DatabaseConnection},
    {provide:COMMAND_TEMPLATE_REPOSITORY, useValue: CommandTemplate},
    {provide:COMMAND_TEMPLATE_PARAMETER_REPOSITORY, useValue: CommandTemplateParameter},
    {provide:COMMAND_RUN_RESULT_REPOSITORY, useValue: CommandRunResult},
    ...PerfTestResultProviders,
    PerfTestService,
    JwtService
  ],
})
export class AppModule {}
