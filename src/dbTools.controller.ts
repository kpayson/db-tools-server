import { Controller, Body, Get, Inject, Post, Param, Query, UseGuards  } from '@nestjs/common';
import { DbExporter, ExportEntity } from './lib/dbExporter';
import { DBImporter, } from './lib/dbImporter';
import { IDBService} from './lib/dbService/dbService.interfaces';
import { MySqlService } from './lib/dbService/mysql.service';
import { DBSeeder } from './lib/dbSeeder';
import { DatabaseConnection, DATABASE_CONNECTION_REPOSITORY } from './database-connection/database-connection.entity';
// import { AuthGuard } from '@nestjs/passport';
//import { JwtAuthGuard } from './auth/jwt-auth.guard';
//import { AuthGuard} from './guards/auth.guard';
import { AuthGuard } from './nest-auth/auth.guard';

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
  userEntity} from './entity-generators'
import { exec } from 'child_process';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

// @ApiBearerAuth()
@ApiTags('dbTools')
@Controller('dbTools')
export class DBToolsController {
  constructor(
    @Inject(DATABASE_CONNECTION_REPOSITORY)
    private readonly connectionRepo: typeof DatabaseConnection

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

  private async getDBService(connectionId:number): Promise<IDBService> {
    const connSettings = await this.connectionRepo.findByPk(connectionId);
    const poolConfig = {
      host: connSettings.host,
      port: connSettings.port,            
      // host: 'cg-aws-broker-prodrj5hgmxlvrne7av.ci7nkegdizyy.us-gov-west-1.rds.amazonaws.com', //this._poolConfig.host, 
      // port: 3306, // this._poolConfig.port,
      database: connSettings.database,
      user: connSettings.username,
      password: connSettings.password,
      connectionLimit:5
    };
    if(connSettings.dialect === 'mariadb') {
      return new MySqlService(poolConfig);
      //return new MariaDBService(poolConfig);
    }
    else if(connSettings.dialect === 'mysql') {
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
  async getTables(@Query('connectionId') connectionId: number =1 ) {
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
  async seedDatabase(@Body() seedCounts: {[entityName: string]: number}, @Query('connectionId') connectionId: number = 1) {
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
      
      const chosenEntitiesToSeed = availableSeedEntities.filter(entity=>seedCounts[entity.name] && seedCounts[entity.name] > 0);
      const dbService = await this.getDBService(connectionId);
      const dbSeeder = new DBSeeder(dbService);

      const truncRes = await dbSeeder.truncAllTables(availableSeedEntities);
      const res = await dbSeeder.seedDatabase(chosenEntitiesToSeed, seedCounts);
      return res;
    }
    catch(err) {
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
}


