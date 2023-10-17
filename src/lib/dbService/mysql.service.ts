
import { createPool, PoolConfig, Pool} from 'mysql';
import { groupBy, map } from 'lodash';
import { Injectable } from '@nestjs/common';
import { ForeignKeyField, IDBService, TableDependencyPair, TableInfo, TableWithColumnsInfo, ColumnInfo } from './dbService.interfaces'

@Injectable()
export class MySqlService implements IDBService {
    private _tableSchema: string;
    private _pool: Pool;

    constructor(
        dbConfig: PoolConfig) {
        this._pool = createPool(dbConfig);
        this._tableSchema = dbConfig.database!;
    }

    private queryAndTransform<T>(queryString: string, rowTransform: (resultRow: any) => T) {
        const prom = new Promise<T[]>((resolve, reject) => {
            this._pool.query(queryString, (error, results) => {
                if (!error) {
                    const transformedResults = results.map(rowTransform);
                    resolve(transformedResults)
                }
                else {
                    reject(error);
                }
            })
        });
        return prom;
    }

    private queryAndTransform2<T>(queryString, tableTransform: ((resultTable: any[]) => T[])) {
        const prom = new Promise<T[]>((resolve, reject) => {
            this._pool.query(queryString, (error, results) => {
                if (!error) {
                    const transformedTable = tableTransform(results);
                    resolve(transformedTable)
                }
                else {
                    reject(error);
                }
            })
        });
        return prom;
    }
    select<T>(queryString: string): Promise<T> {
        const prom = new Promise<T>((resolve, reject) => {
            this._pool.query(queryString, (error, results) => {
                if (!error) {
                    resolve(results)
                }
                else {
                    reject(error);
                }
            })
        });
        return prom;
    }

    insert(queryString: string, values: any[]): Promise<any> {
        const prom = new Promise((resolve, reject) => {
            this._pool.query(queryString, values, (error, results, fields) => {
                if (!error) {
                    resolve(results);
                }
                else {
                    reject(error);
                }
            });
        });

        return prom;
    }

    truncAllAllTables(tables: string[]) {
        const prom = new Promise<void>((resolve, reject) => {
            this._pool.getConnection((err, connection) => {
                if (err) { reject(err); }
                else {
                    connection.query('SET FOREIGN_KEY_CHECKS=0');
                    for (const table of tables) {
                        connection.query("truncate `" + table + "`");
                    }
                    connection.release();
                    resolve();
                }
            });
        });
        return prom;

    }

    allEntityFields(entityName: string): Promise<{ fieldName: string, dataType: string }[]> {
        const columnQuery = `
            Select COLUMN_NAME, DATA_TYPE  
            From INFORMATION_SCHEMA.COLUMNS
            Where TABLE_SCHEMA = '${this._tableSchema}' And
                TABLE_NAME = '${entityName}'
        `;
        const transform = (x: any) => ({ fieldName: x.COLUMN_NAME, dataType: x.DATA_TYPE });

        const prom = this.queryAndTransform<{ fieldName: string, dataType: string }>(columnQuery, transform);
        return prom;
    }

    foreignKeyFields(entityName: string): Promise<ForeignKeyField[]> {
        const foreignKeyQuery = `
            SELECT COLUMN_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = '${this._tableSchema}' AND
            TABLE_NAME = '${entityName}'`;

        const transform = (x: any) => ({
            foreignEntityName: x.REFERENCED_TABLE_NAME,
            fieldName: x.COLUMN_NAME
        });

        const prom = this.queryAndTransform<ForeignKeyField>(foreignKeyQuery, transform);
        return prom;
    }

    tableDependencies(tableNames: string[]): Promise<TableDependencyPair[]> {
        const quotedTableNames = tableNames.map(name => `'${name}'`);
        const dependenciesQuery = `
            SELECT Distinct TABLE_NAME, REFERENCED_TABLE_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = '${this._tableSchema}' And 
            TABLE_NAME in (${quotedTableNames.join(',')}) And
            REFERENCED_TABLE_NAME in (${quotedTableNames.join(',')})`;

        const transform = (x: any) => ({ tableName: x.TABLE_NAME, referencedTableName: x.REFERENCED_TABLE_NAME });

        const prom = this.queryAndTransform<TableDependencyPair>(dependenciesQuery, transform);

        return prom;
    }

    tableAutoPkFields(tableName: string): Promise<string[]> {
        const pkColumnQuery = `
            Select COLUMN_NAME 
            From INFORMATION_SCHEMA.COLUMNS
            Where TABLE_SCHEMA = '${this._tableSchema}' And
                TABLE_NAME = '${tableName}' And
                EXTRA = 'auto_increment' And
                COLUMN_KEY = 'PRI'`;

        const transform = (x: any) => x.COLUMN_NAME;

        const prom = this.queryAndTransform<string>(pkColumnQuery, transform);

        return prom;
    }

    tables(): Promise<TableInfo[]> {
        const queryString = `
            Select TABLE_NAME, TABLE_ROWS 
            From INFORMATION_SCHEMA.TABLES
            Where TABLE_SCHEMA = '${this._tableSchema}'`;

        const transform = (t: any) => ({
            tableName: t.TABLE_NAME,
            rowCount: Number(t.TABLE_ROWS)
        })

        const prom = this.queryAndTransform<TableInfo>(queryString, transform);

        return prom;
    }

    tableColumns(tableName: string) {
        const queryString = `
            Select TABLE_NAME, COLUMN_NAME, IS_NULLABLE, DATA_TYPE, COLUMN_TYPE, COLUMN_KEY, EXTRA
            From INFORMATION_SCHEMA.COLUMNS
            Where Table_Schema = '${this._tableSchema}' and TABLE_NAME='${tableName}'`;

        const transform = (x: any) => ({
            tableName: x.TABLE_NAME,
            columnName: x.COLUMN_NAME,
            isNullable: x.IS_NULLABLE,
            dataType: x.DATA_TYPE,
            columnType: x.COLUMN_TYPE,
            columnKey: x.COLUMN_KEY,
            extra: x.EXTRA
        });

        const prom = this.queryAndTransform<ColumnInfo>(queryString, transform);

        return prom;
    }

    tablesWithColumns(): Promise<TableWithColumnsInfo[]> {
        const queryString = `
            Select TABLE_NAME, COLUMN_NAME, IS_NULLABLE, DATA_TYPE, COLUMN_TYPE, COLUMN_KEY, EXTRA
            From INFORMATION_SCHEMA.COLUMNS
            Where Table_Schema = '${this._tableSchema}'`;

        const rowTransform = (x: any) => ({
            tableName: x.TABLE_NAME,
            columnName: x.COLUMN_NAME,
            isNullable: x.IS_NULLABLE,
            dataType: x.DATA_TYPE,
            columnType: x.COLUMN_TYPE,
            columnKey: x.COLUMN_KEY,
            extra: x.EXTRA
        });

        const tableTransform = (queryRes: any[]) => {
            const table: ColumnInfo[] = queryRes.map(rowTransform);
            const tableWithColumnsArray = map(groupBy(table, g => g.tableName), (value, prop) => ({ tableName: prop, columns: value })) as TableWithColumnsInfo[];
            tableWithColumnsArray.sort((a, b) => { return a.tableName.localeCompare(b.tableName) });
            return tableWithColumnsArray;
        }

        const prom = this.queryAndTransform2<TableWithColumnsInfo>(queryString, tableTransform);

        return prom;
    }

    async tableData(tableName: string, filter?: string) {
        const queryString = `select * from \`${tableName}\` ${filter ? 'where ' + filter : ''}`;
        const rowTransform = (x: any) => x;
        const prom = this.queryAndTransform<ColumnInfo>(queryString, rowTransform);
        return prom;
    }

} 