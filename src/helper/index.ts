/* eslint-disable prettier/prettier */
import { ValidationError } from 'class-validator';
import {
  HttpStatus, 
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

type Data = any | null;

abstract class ResponseObject {
  constructor(
    public success: boolean,
    public message: string,
    public code: string,
    public data: Data = null,
  ) {}
}

/**
 * Helper function to process validation errors and throw a BadRequestException
 * @param errors - Array of ValidationError objects
 */
export function handleValidationErrors(errors: ValidationError[]): void {
  const errorMessages = errors
    .map((error) => Object.values(error.constraints || {}).join(', '))
    .join('; ');

    mapErrorCode(`${HttpStatus.BAD_REQUEST}`, errorMessages);
}

export class SuccessResponseObject extends ResponseObject {
  constructor(message: string, code?: string, data: Data = null) {
    super(true, message, code, data);
  }
}

export const ErrorResponseObject = (error) => {
  if (error instanceof ConflictException) {
    throw new ConflictException(error.message);
  }
  if (error instanceof BadRequestException) {
    mapErrorCode( `${HttpStatus.BAD_REQUEST}`, error.message);
  }
  if (error instanceof NotFoundException) {
    mapErrorCode(`${HttpStatus.NOT_FOUND}`, error.message);
  }
  if (error instanceof UnprocessableEntityException) {
    mapErrorCode(`${HttpStatus.UNPROCESSABLE_ENTITY}`, error.message);
  }

  throw new InternalServerErrorException(error.message);
};


/**
 * Utility to map error codes and messages into a standardized format
 * @param status - HTTP status code
 * @param customCode - Custom FXQL error code
 * @param message - Error message
 */
export function mapErrorCode(
  // status: HttpStatus,
  customCode: string,
  message: string,
): never {
  const errorResponse = {
    code: `FXQL-${customCode}`,
    message,
  };

  switch (customCode) {
    case `${HttpStatus.BAD_REQUEST}`:
      throw new BadRequestException(errorResponse);
    case `${HttpStatus.NOT_FOUND}`:
      throw new NotFoundException(errorResponse);
    case `${HttpStatus.CONFLICT}`:
      throw new ConflictException(errorResponse);
    case `${HttpStatus.INTERNAL_SERVER_ERROR}`:
    default:
      throw new InternalServerErrorException(errorResponse);
  }
}

