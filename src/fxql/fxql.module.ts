import { Module } from '@nestjs/common';
import { FxqlService } from './fxql.service';
import { FxqlController } from './fxql.controller';

@Module({
  providers: [FxqlService],
  controllers: [FxqlController]
})
export class FxqlModule {}
