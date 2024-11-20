/* eslint-disable prettier/prettier */
import { ValidationError } from 'class-validator';
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';

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

  throw new BadRequestException(errorMessages);
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
    throw new BadRequestException(error.message);
  }
  if (error instanceof NotFoundException) {
    throw new NotFoundException(error.message);
  }
  if (error instanceof UnprocessableEntityException) {
    throw new UnprocessableEntityException(error.message);
  }

  throw new InternalServerErrorException(error.message);
};
