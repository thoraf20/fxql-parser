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
  synchronize: process.env.NODE_ENV === 'development' ? true : false,
  autoLoadEntities: true,
  ssl:
    process.env.NODE_ENV === 'development'
      ? false
      : { rejectUnauthorized: false },
  extra: {
    charset: 'utf8mb4_unicode_ci',
  },
};
