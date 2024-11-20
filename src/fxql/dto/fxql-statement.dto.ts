/* eslint-disable prettier/prettier */
// src/fxql/dto/fxql-statement.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Matches,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';

export class FxqlStatementDto {
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'Source currency must be 3 uppercase letters.',
  })
  sourceCurrency: string;

  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'Destination currency must be 3 uppercase letters.',
  })
  destinationCurrency: string;

  @IsNumber(
    { allowNaN: false },
    { message: 'BUY rate must be a valid number.' },
  )
  buyRate: number;

  @IsNumber(
    { allowNaN: false },
    { message: 'SELL rate must be a valid number.' },
  )
  sellRate: number;

  @IsInt({ message: 'CAP must be a whole number.' })
  @Min(0, { message: 'CAP must be 0 or greater.' })
  cap: number;
}

export class FxqlInputDto {
  @ApiProperty()
  @IsString()
  FXQL: string;
}