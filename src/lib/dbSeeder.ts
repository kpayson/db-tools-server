import {createPool, PoolConfig, Connection} from 'mariadb';
import { IDBService, MariaDBService, TableDependencyPair, ColumnInfo} from './dbService';
import { Inject } from '@nestjs/common';
import { POOL_CONFIG } from './config';
import { GraphNode, topologicalSort } from './graphUtil';
import { keyBy } from 'lodash';

export interface SeedEntity{
    name: string // Table name

    // A query that will return all possible foreign key or key combinations to choose from
    // ex
    // Select role.id as roleId, permission.id as permissionId 
    // From role, permission
    // Where role.clientId = permission.clientId
    foreignKeyValuesQuery?: string;

    // if the table is for a many to many relationship then the foreign key combination is unique.
    isManyToManyRelation: boolean;

    // a function that will generate an entity with mock data
    // parameter keys: an object with property names that match the foreign key columns of the entity
    // parameter i: an incrementing index that can be used in generating data values
    dataGen: (keys?: any, i?: number) => any

}

// A raw count or percentage of or count per <parent>
export type countDictionary = { [entityName: string]: number }

export const DB_SEEDER = "DB_SEEDER";

export class DBSeeder {

    private _connectionPromise: any = null;
    private dbService: IDBService;

    constructor(@Inject(POOL_CONFIG)
    dbConfig: PoolConfig) {
        const pool = createPool(dbConfig);
        this._connectionPromise = pool.getConnection();
        this.dbService = new MariaDBService(dbConfig)
    }

    private pickRandomElement(array: any[]) {
        if (array.length === 0) {
          return undefined;
        }
      
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }

    private randomSort(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
          const randomIndex = Math.floor(Math.random() * (i + 1));
          [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
        }
        return array;
      }

    private defaultDataGen(keys:any, columns:ColumnInfo[], foreignKeyFields:string[]) {
    // TODO
    }

    private async topoSortEntities(entities:SeedEntity[]) {
        const tableNames = entities.map(e=>e.name);
        const tableDependencyPairs = await this.dbService.tableDependencies(tableNames)
        const dbGraphNodes = entities.map(entity=> new GraphNode(entity));
        const nodeLookup = keyBy(dbGraphNodes, x=>x.value.name);
        for(const pair of tableDependencyPairs) {
            const node1 = nodeLookup[pair.tableName]
            const node2 = nodeLookup[pair.referencedTableName];
            node2.addNeighbor(node1);
        };
        const sortedNodes = topologicalSort(dbGraphNodes);
        const sortedEntities = sortedNodes.map(x=>x.value);
        return sortedEntities;
    }

      
    
    private async generateInsertDataWithUniqueForeignKeys(entity: SeedEntity, count:number, connection: Connection) {
        const foreignKeyValueSet = entity.foreignKeyValuesQuery ? await connection.query(entity.foreignKeyValuesQuery) : [];
        const foreignKeyValueSetSorted = this.randomSort(foreignKeyValueSet);
        const insertData = [...Array(Math.min(count,foreignKeyValueSet.length)).keys()].map((i)=>{
            return entity.dataGen(foreignKeyValueSetSorted[i],i)
        }); 
        return insertData;
    }

    private async generateInsertDataWithRandomForeignKey(entity: SeedEntity, count:number, connection: Connection) {
        const foreignKeyValueSet = entity.foreignKeyValuesQuery ? await connection.query(entity.foreignKeyValuesQuery) : [];
        // const columns = this.dbService.tableColumns(entity.name);

        const insertData = [...Array(count).keys()].map((i)=>{
            return entity.dataGen(this.pickRandomElement(foreignKeyValueSet),i)
        }); 
        return insertData;
    }
    

    private async seedEntity(entity: SeedEntity, count:number, connection: Connection) {
        console.log("entity="+entity.name)
        console.log(entity.foreignKeyValuesQuery );
        const foreignKeyValueSet = entity.foreignKeyValuesQuery ? await connection.query(entity.foreignKeyValuesQuery) : [];

        const insertData = entity.isManyToManyRelation ? 
            await this.generateInsertDataWithUniqueForeignKeys(entity, count, connection) :
            await this.generateInsertDataWithRandomForeignKey(entity, count, connection);

        const insertFields = Object.keys(insertData[0]);
        const insertFieldList = insertFields.join(',');
        const valuePlaceHolderList = [...Array(insertFields.length).keys()].map(()=>'?').join(',');
        const insertQuery = `INSERT INTO \`${entity.name}\` (${insertFieldList}) Values(${valuePlaceHolderList})`;
        
        for(const row of insertData) {
            const insertRes = await connection.query(insertQuery,Object.values(row));
            console.log(insertRes);
        }

        console.log(foreignKeyValueSet);
    }

    public async truncAllTables(seedEntities: SeedEntity[]) {
        const conn = await this._connectionPromise;
        await conn.query("SET FOREIGN_KEY_CHECKS=0");
        for(const entity of seedEntities) {
            await conn.query("truncate `" + entity.name + "`");
        }
        await conn.query("SET FOREIGN_KEY_CHECKS=1");
    }

    public async seedDatabase(seedEntities: SeedEntity[], entityCounts: countDictionary) {
        const connection = await this._connectionPromise;

        const sortedEntities = await this.topoSortEntities(seedEntities);

        for (const entity of sortedEntities) {
            try {
                const count = entityCounts[entity.name] || 1;
                await this.seedEntity(entity, count, connection); 
            }
            catch(e) {
                console.error("Error seeding entity: " + entity.name)
                console.error(e);
            }
            
        }
    }
}
