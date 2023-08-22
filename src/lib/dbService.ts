import { createPool, PoolConfig, Connection } from 'mariadb';
import { groupBy, map, Dictionary } from 'lodash';
import { Injectable, Inject } from '@nestjs/common';
import { POOL_CONFIG } from './config';


export interface ForeignKeyField {
    foreignEntityName: string; //the table being reference
    fieldName: string //the column
}

export interface TableDependencyPair {
    tableName: string;
    referencedTableName: string;
}

export interface ColumnInfo {
    tableName: string;
    columnName: string;
    isNullable: string;
    dataType: string;
    columnType: string;
    columnKey: string;
    extra: string;
}

export interface TableWithColumnsInfo {
    tableName: string;
    columns: ColumnInfo[];
}

export interface TableInfo {
    tableName: string;
    rowCount: number;
}


export interface IDBService
{
    // sql select query
    select<T>(queryString:string): Promise<T>;

    // insert query
    insert(queryString: string, values:any[]): Promise<any> ;

    // return all entity fields (column names) for a given entity (table)
    allEntityFields(entityName:string): Promise<{fieldName:string, dataType:string}[]>;

    // return columns in the table that are foreign keys along with the table they reference
    foreignKeyFields(entityName:string): Promise<ForeignKeyField[]>;

    // if table A has a column that is a foreign key into table B then then there is a dependency from A to B
    // return all such pairs
    tableDependencies(tableNames: string[]): Promise<TableDependencyPair[]>;

    // return the auto increment pk field
    tableAutoPkFields(tableName: string): Promise<string[]> ;

    // return a list of the database tables that are part of the schema
    tables(): Promise<TableInfo[]>;

    // return an array of column info for the columns in a table
    tableColumns(tableName: string): Promise<ColumnInfo[]>;

    // return a dictionary from the tableName to the column info
    tablesWithColumns(): Promise<Dictionary<any[]>>; 

    // return the data for a table
    tableData(tableName:string, filter?:string): Promise<any[]>;
}
export const DB_SERVICE = "DB_SERVICE";


@Injectable()
export class MariaDBService 
{
    private _tableSchema: string;
    private _connectionPromise:Promise<Connection>;

    constructor(
        @Inject(POOL_CONFIG)
        dbConfig: PoolConfig) {
        //super();
        const pool = createPool(dbConfig);
        this._connectionPromise = pool.getConnection();
        this._tableSchema = dbConfig.database!;
    }

    private async getConnection() {
        return await this._connectionPromise;
    }

    async select<T>(queryString: string): Promise<T> {
        const connection = await this.getConnection();
        const res = await connection.query(queryString);
        return res;
    }

    async insert(queryString: string, values:any[]): Promise<any> {
        const connection = await this.getConnection();
        const res = await connection.query(queryString, values);
        return res;
    }

    async allEntityFields(entityName: string): Promise<{fieldName:string, dataType:string}[]> {
        const columnQuery = `
            Select COLUMN_NAME, DATA_TYPE  
            From INFORMATION_SCHEMA.COLUMNS
            Where TABLE_SCHEMA = '${this._tableSchema}' And
                TABLE_NAME = '${entityName}'
        `;
        const connection = await this.getConnection();
        const columns = await connection.query<{COLUMN_NAME:string, DATA_TYPE:string}[]>(columnQuery);
        const columnNames = columns.map(x=>({fieldName:x.COLUMN_NAME, dataType:x.DATA_TYPE}));
        return columnNames;
    }

    async foreignKeyFields(entityName: string): Promise<ForeignKeyField[]> {
        const foreignKeyQuery = `
            SELECT COLUMN_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = '${this._tableSchema}' AND
            TABLE_NAME = '${entityName}'`;
        const connection = await this.getConnection();
        const fkResult = await connection.query(foreignKeyQuery);

        const foreignKeyFields :ForeignKeyField[] = fkResult.map((x:any)=>{
            return {
                foreignEntityName: x.REFERENCED_TABLE_NAME,
                fieldName: x.COLUMN_NAME
            }
        })

        return foreignKeyFields;
    }

    async tableDependencies(tableNames: string[]): Promise<TableDependencyPair[]> {
        const quotedTableNames = tableNames.map(name=>`'${name}'`);
        const dependenciesQuery = `
            SELECT Distinct TABLE_NAME, REFERENCED_TABLE_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = '${this._tableSchema}' And 
            TABLE_NAME in (${quotedTableNames.join(',')}) And
            REFERENCED_TABLE_NAME in (${quotedTableNames.join(',')})
        ` 
        const connection = await this.getConnection();
        const res = await connection.query(dependenciesQuery);
        const pairs:TableDependencyPair[] = res.map((x:any)=>({tableName:x.TABLE_NAME, referencedTableName:x.REFERENCED_TABLE_NAME}))
        return pairs;
    }

    async tableAutoPkFields(tableName: string): Promise<string[]> {
        const pkColumnQuery = `
            Select COLUMN_NAME 
            From INFORMATION_SCHEMA.COLUMNS
            Where TABLE_SCHEMA = '${this._tableSchema}' And
                TABLE_NAME = '${tableName}' And
                EXTRA = 'auto_increment' And
                COLUMN_KEY = 'PRI'
        `;
        const connection = await this.getConnection();
        const res = await connection.query(pkColumnQuery);
        const pkFields = res.map((x:any)=>x.COLUMN_NAME);
        return pkFields;
    }

    async tables(): Promise<TableInfo[]> {
        const queryString = `
            Select TABLE_NAME, TABLE_ROWS 
            From INFORMATION_SCHEMA.TABLES
            Where TABLE_SCHEMA = '${this._tableSchema}'`;

        const connection = await this.getConnection();
        const res = await connection.query(queryString);
        const names:TableInfo[] = res.map(t=>{
            return {
                tableName: t.TABLE_NAME,
                rowCount: Number(t.TABLE_ROWS)
            };
        })
        return names;
    }

    async tableColumns(tableName: string) {
        const queryString = `
            Select TABLE_NAME, COLUMN_NAME, IS_NULLABLE, DATA_TYPE, COLUMN_TYPE, COLUMN_KEY, EXTRA
            From INFORMATION_SCHEMA.COLUMNS
            Where Table_Schema = '${this._tableSchema}' and TABLE_NAME='${tableName}'
        `;

        const connection = await this.getConnection();
        const res = await connection.query(queryString);
        const data = res.map((x:any)=>({
            tableName: x.TABLE_NAME,
            columnName: x.COLUMN_NAME,
            isNullable: x.IS_NULLABLE,
            dataType: x.DATA_TYPE,
            columnType: x.COLUMN_TYPE,
            columnKey: x.COLUMN_KEY,
            extra: x.EXTRA
        }));

        return data;
    }

    async tablesWithColumns(): Promise<TableWithColumnsInfo[]> {

        const queryString = `
            Select TABLE_NAME, COLUMN_NAME, IS_NULLABLE, DATA_TYPE, COLUMN_TYPE, COLUMN_KEY, EXTRA
            From INFORMATION_SCHEMA.COLUMNS
            Where Table_Schema = '${this._tableSchema}'
        `;

        const connection = await this.getConnection();
        const res = await connection.query(queryString);
        const data = res.map((x:any)=>({
            tableName: x.TABLE_NAME,
            columnName: x.COLUMN_NAME,
            isNullable: x.IS_NULLABLE,
            dataType: x.DATA_TYPE,
            columnType: x.COLUMN_TYPE,
            columnKey: x.COLUMN_KEY,
            extra: x.EXTRA
        }))

        const tableWithColumnsArray = map(groupBy(data, g=>g.tableName), (value, prop) => ({ tableName:prop, columns:value })) as TableWithColumnsInfo[];
        tableWithColumnsArray.sort((a,b)=>{return a.tableName.localeCompare(b.tableName)});

        return tableWithColumnsArray;
    }

    async tableData(tableName:string, filter?:string) {
        const queryString = `select * from \`${tableName}\` ${filter? 'where ' + filter : ''}`;
        const connection = await this.getConnection();
        const res = await connection.query(queryString);
        return res;
    }

} 