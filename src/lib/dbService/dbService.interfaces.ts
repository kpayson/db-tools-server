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

    truncAllAllTables(tables: string[]): Promise<void>;

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
    tablesWithColumns(): Promise<TableWithColumnsInfo[]>; 

    // return the data for a table
    tableData(tableName:string, filter?:string): Promise<any[]>;
}
export const DB_SERVICE = "DB_SERVICE";