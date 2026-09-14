import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

export const createValidationPipe = (
  options?: ValidationPipeOptions,
): ValidationPipe => {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    ...options,
  });
};
