/* eslint-disable prettier/prettier */
import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { FxqlService } from './fxql.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponseObject, SuccessResponseObject } from 'src/helper';
import { FxqlInputDto } from './dto/fxql-statement.dto';

@ApiTags('Mira')
@Controller('fxql')
export class FxqlController {
  private readonly logger = new Logger(FxqlController.name);

  constructor(private readonly fxqlService: FxqlService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process FXQL statement' })
  async submitFxql(@Body() body: FxqlInputDto) {
    try {
      const savedStatement = await this.fxqlService.saveFxql(body.FXQL);
      return new SuccessResponseObject(
        'Rate parsed successfully.',
        "FXQL-200",
        savedStatement,
      );
    } catch (error) {
      this.logger.error(`Fetch wallet error. ${error.message}`, error.stack);
      ErrorResponseObject(error);
    }
  }
}
