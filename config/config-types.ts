export interface PoolConfig {
    host: string,
    port: number,
    database: string,
    user: string,
    password: string,
    connectionLimit: number
}
export type SeedCountDictionary = {[tableName:string]:number}

export interface PerfTestSettings {
    authServer: string,
    username: string ,
    password: string,
    perfTestScriptPath: string,
    k6Path: string,
    reportOutputPath: string
}
