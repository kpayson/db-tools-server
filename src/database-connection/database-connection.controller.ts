import { Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import { DatabaseConnection, DATABASE_CONNECTION_REPOSITORY } from './database-connection.entity';
import { Inject } from '@nestjs/common';

interface DatabaseConnectionDTO {
    id?: number;
    name: string;
    connectionString: string;
}

@Controller('database-connection')
export class DatabaseConnectionController {
    constructor(
        @Inject(DATABASE_CONNECTION_REPOSITORY)
        private databaseConnection: typeof DatabaseConnection
    ) { }

    @Get()
    async findAll(): Promise<DatabaseConnection[]> {
        const res = await this.databaseConnection.findAll();
        return res;
    }

    @Post()
    async create(@Body() connection: DatabaseConnection): Promise<DatabaseConnection> {
        const res = await this.databaseConnection.create({ 
            name: connection.name, 
            host: connection.host, 
            port: connection.port, 
            database: connection.database,
            username: connection.username,
            password: connection.password
        });
        return res;
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() connection: DatabaseConnection): Promise<[affectedCount: number]> {
        const res = await this.databaseConnection.update({ 
            name: connection.name, 
            host: connection.host, 
            port: connection.port, 
            database: connection.database,
            username: connection.username,
            password: connection.password
        },
            {
                where: {
                    lastName: null
                }
            });
        return res;
    }

    @Delete(':id')
    async destroy(@Param('id') id: number): Promise<number> {
        const res = await this.databaseConnection.destroy({ where: { id } });
        return res;
    }
}