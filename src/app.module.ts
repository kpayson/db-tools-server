import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DB_SERVICE, MariaDBService } from './lib/dbService';
import { DB_EXPORTER, DbExporter} from './lib/dbExporter';
import { DB_IMPORTER, DBImporter} from './lib/dbImporter';
import { DB_SEEDER, DBSeeder} from './lib/dbSeeder';
import { POOL_CONFIG } from './lib/config';
import * as config from 'config';


@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {provide:POOL_CONFIG, useFactory: ()=>config.get("poolConfig")},
    {provide:DB_SERVICE, useClass: MariaDBService },
    {provide:DB_EXPORTER, useClass: DbExporter },
    {provide:DB_IMPORTER, useClass: DBImporter },
    {provide:DB_SEEDER, useClass: DBSeeder },
  ],
})
export class AppModule {}
