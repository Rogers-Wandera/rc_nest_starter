import { DataSourceOptions } from 'typeorm';
import * as path from 'path';

export const ConfigOptions = (): DataSourceOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  // entities: [
  //   path.join(__dirname, '..', '..', '**', '*.entity.{ts,js}'),
  //   path.join(__dirname, '..', '..', '**', '*.view.{ts,js}'),
  // ],
  // migrations: ['src/migration/**/*.ts'],
  // subscribers: [path.join(__dirname, '..', '..', '**', '*.subscriber.{ts,js}')],
});
