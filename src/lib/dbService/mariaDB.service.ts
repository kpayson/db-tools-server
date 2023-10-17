
import { createPool, PoolConfig, Connection, Pool, PoolConnection } from 'mariadb';
import { groupBy, map } from 'lodash';
import { Injectable } from '@nestjs/common';

import { ForeignKeyField, IDBService, TableDependencyPair, TableInfo, TableWithColumnsInfo } from './dbService.interfaces'
@Injectable()
export class MariaDBService implements IDBService {
    private _tableSchema: string;
    private _connectionPromise: Promise<Connection>;
    private _pool: Pool;

    constructor(
        dbConfig: PoolConfig) {
        this._pool = createPool(dbConfig);
        this._tableSchema = dbConfig.database!;
    }

    private async getConnection() {
        return this._pool.getConnection();
    }

    async select<T>(queryString: string): Promise<T> {
        let connection: PoolConnection;
        try {
            connection = await this.getConnection();
            const res = await connection.query(queryString);
            return res;
        }
        catch (err) {
            // Manage Errors
            console.log(err);
            throw err;
        } finally {
            // Close Connection
            if (connection) connection.end();
        }

    }

    async insert(queryString: string, values: any[]): Promise<any> {
        let connection: PoolConnection;
        try {
            connection = await this.getConnection();
            const res = await connection.query(queryString, values);

            return res;
        }
        finally {
            connection.end();
        }

    }

    async truncAllAllTables(tables: string[]) {
        let connection: PoolConnection;
        try {
            connection = await this.getConnection();
            await connection.query("SET FOREIGN_KEY_CHECKS=0");
            for (const table of tables) {
                await connection.query("truncate `" + table + "`");
            }
            await connection.query("SET FOREIGN_KEY_CHECKS=1");
        }
        finally {
            connection.end();
        }
    }

    async allEntityFields(entityName: string): Promise<{ fieldName: string, dataType: string }[]> {
        let connection: PoolConnection;
        try {
            const columnQuery = `
                Select COLUMN_NAME, DATA_TYPE  
                From INFORMATION_SCHEMA.COLUMNS
                Where TABLE_SCHEMA = '${this._tableSchema}' And
                    TABLE_NAME = '${entityName}'
            `;
            connection = await this.getConnection();
            const columns = await connection.query<{ COLUMN_NAME: string, DATA_TYPE: string }[]>(columnQuery);
            const columnNames = columns.map(x => ({ fieldName: x.COLUMN_NAME, dataType: x.DATA_TYPE }));
            return columnNames;
        }
        finally {
            connection.end();
        }
    }

    async foreignKeyFields(entityName: string): Promise<ForeignKeyField[]> {
        let connection: PoolConnection;
        try {
            const foreignKeyQuery = `
                SELECT COLUMN_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE REFERENCED_TABLE_SCHEMA = '${this._tableSchema}' AND
                TABLE_NAME = '${entityName}'`;
            connection = await this.getConnection();
            const fkResult = await connection.query(foreignKeyQuery);

            const foreignKeyFields: ForeignKeyField[] = fkResult.map((x: any) => {
                return {
                    foreignEntityName: x.REFERENCED_TABLE_NAME,
                    fieldName: x.COLUMN_NAME
                }
            })

            return foreignKeyFields;
        }
        finally {
            connection.end();
        }
    }

    async tableDependencies(tableNames: string[]): Promise<TableDependencyPair[]> {
        let connection: PoolConnection;
        try {
            const quotedTableNames = tableNames.map(name => `'${name}'`);
            const dependenciesQuery = `
                SELECT Distinct TABLE_NAME, REFERENCED_TABLE_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE REFERENCED_TABLE_SCHEMA = '${this._tableSchema}' And 
                TABLE_NAME in (${quotedTableNames.join(',')}) And
                REFERENCED_TABLE_NAME in (${quotedTableNames.join(',')})
            `
            connection = await this.getConnection();
            const res = await connection.query(dependenciesQuery);
            connection.end();
            const pairs: TableDependencyPair[] = res.map((x: any) => ({ tableName: x.TABLE_NAME, referencedTableName: x.REFERENCED_TABLE_NAME }))
            return pairs;
        }
        finally {
            connection.end();
        }
    }

    async tableAutoPkFields(tableName: string): Promise<string[]> {


        let connection: PoolConnection;
        try {
            const pkColumnQuery = `
            Select COLUMN_NAME 
            From INFORMATION_SCHEMA.COLUMNS
            Where TABLE_SCHEMA = '${this._tableSchema}' And
                TABLE_NAME = '${tableName}' And
                EXTRA = 'auto_increment' And
                COLUMN_KEY = 'PRI'`;
            connection = await this.getConnection();
            const res = await connection.query(pkColumnQuery);
            const pkFields = res.map((x: any) => x.COLUMN_NAME);

            return pkFields;
        }
        finally {
            connection.end();
        }
    }

    async tables(): Promise<TableInfo[]> {
        let connection: PoolConnection;
        try {
            const queryString = `
                Select TABLE_NAME, TABLE_ROWS 
                From INFORMATION_SCHEMA.TABLES
                Where TABLE_SCHEMA = '${this._tableSchema}'`;

            connection = await this.getConnection();
            const res = await connection.query(queryString);

            const names: TableInfo[] = res.map(t => {
                return {
                    tableName: t.TABLE_NAME,
                    rowCount: Number(t.TABLE_ROWS)
                };
            })

            return names;
        }
        finally {
            connection.end();
        }


    }

    async tableColumns(tableName: string) {
        let connection: PoolConnection;
        try {

            const queryString = `
                Select TABLE_NAME, COLUMN_NAME, IS_NULLABLE, DATA_TYPE, COLUMN_TYPE, COLUMN_KEY, EXTRA
                From INFORMATION_SCHEMA.COLUMNS
                Where Table_Schema = '${this._tableSchema}' and TABLE_NAME='${tableName}'`;
            connection = await this.getConnection();
            const res = await connection.query(queryString);
            const data = res.map((x: any) => ({
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
        finally {
            connection.end();
        }

    }

    async tablesWithColumns(): Promise<TableWithColumnsInfo[]> {
        let connection: PoolConnection;
        try {
            const queryString = `
            Select TABLE_NAME, COLUMN_NAME, IS_NULLABLE, DATA_TYPE, COLUMN_TYPE, COLUMN_KEY, EXTRA
            From INFORMATION_SCHEMA.COLUMNS
            Where Table_Schema = '${this._tableSchema}'`;

            connection = await this.getConnection();
            const res = await connection.query(queryString);
            const data = res.map((x: any) => ({
                tableName: x.TABLE_NAME,
                columnName: x.COLUMN_NAME,
                isNullable: x.IS_NULLABLE,
                dataType: x.DATA_TYPE,
                columnType: x.COLUMN_TYPE,
                columnKey: x.COLUMN_KEY,
                extra: x.EXTRA
            }))

            const tableWithColumnsArray = map(groupBy(data, g => g.tableName), (value, prop) => ({ tableName: prop, columns: value })) as TableWithColumnsInfo[];
            tableWithColumnsArray.sort((a, b) => { return a.tableName.localeCompare(b.tableName) });
            return tableWithColumnsArray;
        }
        finally {
            connection.end();
        }
    }

    async tableData(tableName: string, filter?: string) {
        let connection: PoolConnection;
        try {
            connection = await this.getConnection();
            const queryString = `select * from \`${tableName}\` ${filter ? 'where ' + filter : ''}`;
            const res = await connection.query(queryString);
            return res;
        }
        finally {
            connection.end();
        }


    }

} 