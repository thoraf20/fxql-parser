import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FxqlModule } from './fxql/fxql.module';

@Module({
  imports: [FxqlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
