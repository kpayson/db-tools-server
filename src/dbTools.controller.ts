import { Controller, Body, Get, Inject, Post, Param, Query, UseGuards, HttpException, Header, Response } from '@nestjs/common';
import { DbExporter, ExportEntity } from './lib/dbExporter';
import { DBImporter, } from './lib/dbImporter';
import { IDBService } from './lib/dbService/dbService.interfaces';
import { MySqlService } from './lib/dbService/mysql.service';
import { DBSeeder } from './lib/dbSeeder';
import { DatabaseConnection, DATABASE_CONNECTION_REPOSITORY } from './database-connection/database-connection.entity';
import { CustomView, CUSTOM_VIEW_REPOSITORY } from './custom-view/custom-view.entity';
import { DataReport, DATA_REPORT_REPOSITORY } from './data-report/data-report.entity';
// import { AuthGuard } from '@nestjs/passport';
//import { JwtAuthGuard } from './auth/jwt-auth.guard';
//import { AuthGuard} from './guards/auth.guard';
import { AuthGuard } from './nest-auth/auth.guard';
import { SqlParserService } from './sql-parser/sql-parser.service';
import Handlebars from 'handlebars';
//import {CACHE_MANAGER, Cache} from '@nestjs/cache-manager';
import { v4 as uuidv4 } from 'uuid';

const pdf = require('html-pdf');
const fs = require('fs');

import {
  clientEntity,
  groupEntity,
  groupRoleEntity,
  identityProviderEntity,
  namespaceEntity,
  permissionEntity,
  roleEntity,
  rolePermissionEntity,
  tenantEntity,
  tenantUserEntity,
  userEntity
} from './entity-generators'
import { exec } from 'child_process';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

interface Email {
  to: string;
  subject: string;
  body: string;
  attachment: string;
}


// @ApiBearerAuth()
@ApiTags('dbTools')
@Controller('dbTools')
export class DBToolsController {
  constructor(
    @Inject(DATABASE_CONNECTION_REPOSITORY)
    private readonly connectionRepo: typeof DatabaseConnection,

    // @Inject(CACHE_MANAGER) private cacheManager: Cache,

    @Inject(CUSTOM_VIEW_REPOSITORY)
    private readonly customViewRepo: typeof CustomView,

    @Inject(DATA_REPORT_REPOSITORY)
    private readonly dataReportRepo: typeof DataReport,

    private readonly sqlParserService: SqlParserService
  ) { }

  private fixForJsonSerialization(obj: any): any {
    // toString any bigint values to prevent any json serialization errors
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          obj[i] = this.fixForJsonSerialization(obj[i]);
        }
      } else {
        for (let key in obj) {
          obj[key] = this.fixForJsonSerialization(obj[key]);
        }
      }
    } else if (typeof obj === 'bigint') {
      return obj.toString();
    }

    return obj;
  }

  private async getDBService(connectionId: number): Promise<IDBService> {
    const connSettings = await this.connectionRepo.findByPk(connectionId);
    const poolConfig = {
      host: connSettings.host,
      port: connSettings.port,
      // host: 'cg-aws-broker-prodrj5hgmxlvrne7av.ci7nkegdizyy.us-gov-west-1.rds.amazonaws.com', //this._poolConfig.host, 
      // port: 3306, // this._poolConfig.port,
      database: connSettings.database,
      user: connSettings.username,
      password: connSettings.password,
      connectionLimit: 5
    };
    if (connSettings.dialect === 'mariadb') {
      return new MySqlService(poolConfig);
      //return new MariaDBService(poolConfig);
    }
    else if (connSettings.dialect === 'mysql') {
      return new MySqlService(poolConfig);
    }
    else {
      throw 'unsupported database dialect';
    }

  }

  @Get("TablesWithColumns")
  async getTablesWithColumns(@Query('connectionId') connectionId: number = 1) {
    try {

      const dbService = await this.getDBService(connectionId);
      const res = await dbService.tablesWithColumns();
      console.log('res');
      return res;
    } catch (err) {
      console.log(err);
    }
  }

  @Get("Tables")
  async getTables(@Query('connectionId') connectionId: number = 1) {
    try {
      const dbService = await this.getDBService(connectionId);
      const res = await dbService.tables();
      console.log('res');
      return res;
    }
    catch (err) {
      console.log(err);
    }

  }

  @Get("TableData/:tableName")
  async getTableData(@Param('tableName') tableName: string, @Query('connectionId') connectionId: number = 1) {
    try {
      const dbService = await this.getDBService(connectionId);
      const data = await dbService.tableData(tableName);
      const fixedData = this.fixForJsonSerialization(data);
      return fixedData;
    } catch (err) {
      console.log(err)
    }
  }

  @Post("ExportData")
  @ApiOperation({ summary: 'export data' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(AuthGuard)
  async exportData(@Body() exportEntities: ExportEntity[], @Query('connectionId') connectionId: number = 1) {
    try {
      const dbService = await this.getDBService(connectionId);
      const dbExporter = new DbExporter(dbService);

      const data = await dbExporter.exportDB(exportEntities);
      const fixedData = this.fixForJsonSerialization(data);

      return fixedData; //obj;
    } catch (err) {
      console.log(err);
    }
  }

  @Post("ImportData")
  async importData(@Body() importObj: { [entityName: string]: any[] }, @Query('connectionId') connectionId: number = 1) {
    try {
      const dbService = await this.getDBService(connectionId);
      const dbImporter = new DBImporter(dbService);

      const res = await dbImporter.importDB(importObj);
      return res;
    }
    catch (err) {
      console.log(err);
    }
  }

  @Post("SeedDatabase")
  async seedDatabase(@Body() seedCounts: { [entityName: string]: number }, @Query('connectionId') connectionId: number = 1) {
    try {
      const availableSeedEntities = [
        clientEntity,
        groupEntity,
        groupRoleEntity,
        identityProviderEntity,
        namespaceEntity,
        permissionEntity,
        roleEntity,
        rolePermissionEntity,
        tenantEntity,
        tenantUserEntity,
        userEntity];

      const chosenEntitiesToSeed = availableSeedEntities.filter(entity => seedCounts[entity.name] && seedCounts[entity.name] > 0);
      const dbService = await this.getDBService(connectionId);
      const dbSeeder = new DBSeeder(dbService);

      const truncRes = await dbSeeder.truncAllTables(availableSeedEntities);
      const res = await dbSeeder.seedDatabase(chosenEntitiesToSeed, seedCounts);
      return res;
    }
    catch (err) {
      console.log(err);
    }
  }

  @Post("PerfTest")
  async perfTest(@Body() testParams: any, @Query('connectionId') connectionId: number = 1) {
    exec('ls -lh', (error, stdout, stderr) => {
      if (error) {
        console.error(`error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      console.log(`stdout:\n${stdout}`);
    });
  }

  //   private replaceQueryVariablesWithQuestionMark(query: string): string {
  //     return query.replace(/@\w+/g, '?');
  // }

  private extractVariables(query: string): string[] {
    const matches = query.match(/@\w+/g);
    return matches ? matches.map(variable => variable.slice(1)) : [];
  }

  private async runViewQuery(customViewId:number, paramValuesObj: any, connectionId: number)
   {
    const customView = await this.customViewRepo.findByPk(customViewId);
    const paramVariables = this.extractVariables(customView.viewSql);
    const paramsValueArray = paramVariables.map(variable => paramValuesObj[variable])
    const dbService = await this.getDBService(connectionId);

    const parseRes = this.sqlParserService.parseSelect(customView.viewSql);
    const viewSql = customView.viewSql.replace(/@\w+/g, '?');
    const viewData = await dbService.select(viewSql, paramsValueArray);

    return viewData;

  }

  @Post("RunCustomView")
  async customView(@Body() customViewInfo: any, @Query('connectionId') connectionId: number = 1) {
    try {
      const customViewId = customViewInfo.customViewId;
      const paramValuesObj = customViewInfo.params;
      const viewData = await this.runViewQuery(customViewId, paramValuesObj, connectionId);
      return viewData
      // const customView = await this.customViewRepo.findByPk(customViewId);
      // const paramVariables = this.extractVariables(customView.viewSql);
      // const paramsValueArray = paramVariables.map(variable => paramValuesObj[variable])
      // const dbService = await this.getDBService(connectionId);

      // const parseRes = this.sqlParserService.parseSelect(customView.viewSql);
      // const viewSql = customView.viewSql.replace(/@\w+/g, '?');
      // const viewData = await dbService.select(viewSql, paramsValueArray);

      // return viewData;

    } catch (err) {
      console.log(err);
      throw new HttpException("Error running custom view", 500);

    }
  }

  private pdfFromHtml(htmlContent: string, fileName: string, res: any) {
    try {
      pdf.create(htmlContent).toStream(function(err, stream){
        stream.pipe(fs.createWriteStream(fileName));
      });
      // pdf.create(htmlContent).toFile("/Users/kenpayson/Documents/htmlToPdf.pdf", (err, res) => {
      //   if (err) return console.log(err);
      //   console.log('PDF generated successfully:', res);
      // });
    } catch (error) {
      console.error('Error fetching URL:', error);
    }
  }

  @Post("RunDataReport")
  @Header('content-type', 'text/html')
  async dataReport(@Body() dataReportInfo: any, @Query('connectionId') connectionId: number = 1) {
    try {
      const dataReportId = dataReportInfo.dataReportId;
      const reportParams = dataReportInfo.params.reportParams;
      const viewParams = dataReportInfo.params.viewParams;
      const dataReport = await this.dataReportRepo.findByPk(dataReportId);

      const viewData = await this.runViewQuery(dataReport.customViewId, viewParams, connectionId);
      const paramValuesObj = {
        report: reportParams,
        view: viewParams,
        rows: viewData
      }
      Handlebars.registerHelper('localDateString', function (aString) {
        return new Date(aString).toLocaleDateString();
      })
      const foo = new Date().toLocaleDateString()
      const template = Handlebars.compile(dataReport.reportTemplate);
      const report = template(paramValuesObj);

      const reportCacheKey = uuidv4();
      // this.cacheManager.set(reportCacheKey, report, 3600); // cache for 1 hour
      return {key:reportCacheKey, report:report};

    } catch (err) {
      console.log(err);
      throw new HttpException("Error running data report", 500);

    }
  }

  @Post("RunDataReportPDF")
  @Header('content-type', 'application/pdf')
  async dataReportPDF(@Body() dataReportInfo: any, @Query('connectionId') connectionId: number = 1, @Response() res: any) {
    try {
      const dataReportId = dataReportInfo.dataReportId;
      const reportParams = dataReportInfo.params.reportParams;
      const viewParams = dataReportInfo.params.viewParams;
      const dataReport = await this.dataReportRepo.findByPk(dataReportId);

      const viewData = await this.runViewQuery(dataReport.customViewId, viewParams, connectionId);
      const paramValuesObj = {
        report: reportParams,
        rows: viewData
      }
      const template = Handlebars.compile(dataReport.reportTemplate);
      const report = template(paramValuesObj);
      const fileName = dataReport.name.replace(/\s+/g, '_') + '.pdf';
      this.pdfFromHtml(report, fileName , res);


    } catch (err) {
      console.log(err);
      throw new HttpException("Error running data report", 500);

    }
  }

  @Post("EmailDataReport")
  async emailDataReport() {
  // TODO
  }

}
