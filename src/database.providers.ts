import { Sequelize } from 'sequelize-typescript';
import { PerfTestResult } from 'src/perf-test/perf-test-result.entity';
import { DatabaseConnection } from './database-connection/database-connection.entity';
import { CommandTemplate } from './command-template/command-template.entity';
import { CommandTemplateParameter } from './command-template/command-template-parameter.entity';
import { CommandRunResult } from './command-run-result/command-run-result.entity';


export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        // dialect: 'sqlite',
        // storage: ':memory:', // Use an in-memory database
        dialect: 'mariadb',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'dbTools',
      });

      sequelize.addModels([
        PerfTestResult, 
        DatabaseConnection, 
        CommandTemplate, 
        CommandTemplateParameter, 
        CommandRunResult]);
      await sequelize.sync({ force: false  });
      return sequelize;
    },
  },
];