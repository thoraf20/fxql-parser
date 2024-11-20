/* eslint-disable prettier/prettier */
import { Injectable, HttpStatus } from '@nestjs/common';
import { FxqlStatementDto } from './dto/fxql-statement.dto';
import { FxqlStatement } from './entities/fxql-statement.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { handleValidationErrors, mapErrorCode } from 'src/helper';

interface ParsedFxqlStatement {
  sourceCurrency: string;
  destinationCurrency: string;
  buyRate: number;
  sellRate: number;
  cap: number;
}

@Injectable()
export class FxqlService {
  private readonly MAX_PAIRS_PER_REQUEST = 1000;

  constructor(
    @InjectRepository(FxqlStatement)
    private readonly fxqlRepository: Repository<FxqlStatement>,
  ) {}

  async saveFxql(fxql: string): Promise<FxqlStatement> {
    const parsed = this.parseFxql(fxql);
    const fxqlDto = this.transformParsedData(parsed);

    // Validate the parsed DTO
    const errors = await validate(fxqlDto);

    if (errors.length > 0) {
      handleValidationErrors(errors);
    }

    return await this.fxqlRepository.save(fxqlDto);
  }

  private parseFxql(fxql: string): ParsedFxqlStatement[] {
    const cleanedFxql = fxql.replace(/\\n/g, '\n').trim();

    const statements = cleanedFxql.split(/\n\n/);

    if (statements.length > this.MAX_PAIRS_PER_REQUEST) {
      mapErrorCode(
        `${HttpStatus.BAD_REQUEST}`,
        `Maximum allowed currency pairs is ${this.MAX_PAIRS_PER_REQUEST}, gotten ${statements.length} in the request.`,
      );
    }

    const parsedStatements: ParsedFxqlStatement[] = statements.map(
      (statement) => {
        // Match the structure of a single FXQL statement
        const regex =
          /^(\w{3})-(\w{3})\s*{\s*BUY\s+([\d.]+)\s+SELL\s+([\d.]+)\s+CAP\s+(\d+)\s*}$/m;
        const match = statement.match(regex);

        if (!match) {
          mapErrorCode(
            `${HttpStatus.BAD_REQUEST}`,
            `Invalid FXQL statement: ${statement}`,
          );
        }

        const [, sourceCurrency, destinationCurrency, buyRate, sellRate, cap] =
          match;

        // Return the parsed statement
        return {
          sourceCurrency,
          destinationCurrency,
          buyRate: parseFloat(buyRate),
          sellRate: parseFloat(sellRate),
          cap: parseInt(cap, 10),
        };
      },
    );

    return parsedStatements;
  }

  private transformParsedData(data: Record<string, any>): FxqlStatementDto {
    const transformData = data.map((value) => {
      return {
        sourceCurrency: value.sourceCurrency,
        destinationCurrency: value.destinationCurrency,
        buyRate: value.buyRate,
        sellRate: value.sellRate,
        capAmount: value.cap,
      };
    });

    return transformData;
  }
}