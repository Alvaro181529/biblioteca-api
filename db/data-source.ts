import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config();
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/db/migrations/*{.ts,.js}'],
  logging: false,
  synchronize: false,
  ssl: process.env.POSTGRES_SSL === 'true',
  extra: {
    ssl:
      process.env.POSTGRES_SSL === 'true'
        ? {
            rejectUnauthorized: false,
          }
        : null,
  },
};
const sourceOptions = new DataSource(dataSourceOptions);
export default sourceOptions;
