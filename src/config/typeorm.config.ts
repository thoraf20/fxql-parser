/* eslint-disable prettier/prettier */
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: `${process.env.DB_PASS}`,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity.js'],
  synchronize: true,
  autoLoadEntities: true,
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'local' ? true : false,
  },
  extra: {
    charset: 'utf8mb4_unicode_ci',
  },
};
