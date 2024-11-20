import { Module } from '@nestjs/common';
import { FxqlService } from './fxql.service';
import { FxqlController } from './fxql.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxqlStatement } from './entities/fxql-statement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FxqlStatement])],
  providers: [FxqlService],
  controllers: [FxqlController],
})
export class FxqlModule {}
