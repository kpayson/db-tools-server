import { Controller, Body, Get, Inject, Post, Param } from '@nestjs/common';
import { DbExporter, DB_EXPORTER, ExportEntity } from './lib/dbExporter';
import { DBImporter, DB_IMPORTER } from './lib/dbImporter';
import { IDBService, DB_SERVICE } from './lib/dbService';
import { DBSeeder, DB_SEEDER } from './lib/dbSeeder';

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


@Controller()
export class AppController {
  constructor(

    @Inject(DB_EXPORTER)
    private readonly dbExporter: DbExporter,

    @Inject(DB_IMPORTER)
    private readonly dbImporter: DBImporter,

    @Inject(DB_SEEDER)
    private readonly dbSeeder: DBSeeder,

    @Inject(DB_SERVICE)
    private readonly dbService: IDBService) { }

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

  @Get("TablesWithColumns")
  async getTablesWithColumns() {
    try {
      const res = await this.dbService.tablesWithColumns();
      console.log('res');
      return res;
    } catch (err) {
      console.log(err);
    }
  }

  @Get("Tables")
  async getTables() {
    const res = await this.dbService.tables();
    console.log('res');
    return res;
  }

  @Get("TableData/:tableName")
  async getTableData(@Param('tableName') tableName: string) {
    try {
      const data = await this.dbService.tableData(tableName);
      const fixedData = this.fixForJsonSerialization(data);
      return fixedData;
    } catch (err) {
      console.log(err)
    }
  }

  @Post("ExportData")
  async exportData(@Body() exportEntities: ExportEntity[]) {
    try {
      const data = await this.dbExporter.exportDB(exportEntities);
      const fixedData = this.fixForJsonSerialization(data);
      //this.fixForJsonSerialization(data);

      // toString any bigint values to prevent any json serialization errors
      // for(const table of Object.keys(data)) {
      //   for(const row of data[table]) {
      //     for(const column of Object.keys(row)) {
      //       if(typeof row[column] === 'bigint') {
      //         row[column] = row[column].toString();
      //       }
      //     }
      //   }
      // }

      return fixedData; //obj;
    } catch (err) {
      console.log(err);
    }
  }

  @Post("ImportData")
  async importData(@Body() importObj: { [entityName: string]: any[] }) {
    try {
      await this.dbImporter.importDB(importObj);
    }
    catch (err) {
      console.log(err);
    }
  }

  @Post("SeedDatabase")
  async seedDatabase(@Body() seedCounts: {[entityName: string]: number}) {
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
      const truncRes = await this.dbSeeder.truncAllTables(chosenEntitiesToSeed);
      const res = await this.dbSeeder.seedDatabase(chosenEntitiesToSeed, seedCounts);
      return res;
    }
    catch(err) {
      console.log(err);
    }
  }
}


