import { Column, DataType, Model, Table } from 'sequelize-typescript';

export const DATABASE_CONNECTION_REPOSITORY = "DATABASE_CONNECTION_REPOSITORY";

@Table({timestamps:false})
export class DatabaseConnection extends Model
{
    @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true, 
    })
    id: number;

    @Column({
      type: DataType.STRING,
      unique: true,
      allowNull: false,
    })
    name: string;

    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    dialect: string;

    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    host: string;

    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    port: number;

    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    database: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
      })
      username: string;
    
    @Column({
        type: DataType.STRING,
        allowNull: true,
      })
      password: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
      })
      authServer: string;

}




