/* eslint-disable prettier/prettier */
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FxqlModule } from './fxql/fxql.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { CustomLogger } from './custom/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    FxqlModule,
  ],
  // providers: [
  //   {
  //     provide: Logger,
  //     useClass: CustomLogger,
  //   },
  // ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: Logger,
      useClass: CustomLogger,
    },
  ],
})
export class AppModule {}
