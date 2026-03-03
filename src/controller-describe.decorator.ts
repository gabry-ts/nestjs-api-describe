import { applyDecorators, Delete, Get, Patch, Post, Put, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { ControllerDescribeOptions, HttpMethod } from './types';
import { IS_PUBLIC_KEY } from './types';

const METHOD_DECORATORS: Record<HttpMethod, (path?: string) => MethodDecorator> = {
  GET: Get,
  POST: Post,
  PUT: Put,
  PATCH: Patch,
  DELETE: Delete,
};

const ERROR_DESCRIPTIONS: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
};

function getErrorDescription(code: number): string {
  return ERROR_DESCRIPTIONS[code] ?? `Error ${String(code)}`;
}

function getErrorDecorators(errors: number[]): MethodDecorator[] {
  return errors.map((code) =>
    ApiResponse({
      status: code,
      description: getErrorDescription(code),
    }),
  );
}

function getSuccessStatus(method: HttpMethod): number {
  return method === 'POST' ? 201 : 200;
}

function addPublicDecorators(
  decorators: (MethodDecorator | ClassDecorator)[],
  isPublic: boolean,
  allErrors: Set<number>,
): void {
  if (isPublic) {
    allErrors.delete(401);
    allErrors.delete(403);
    decorators.push(SetMetadata(IS_PUBLIC_KEY, true));
  } else {
    decorators.push(ApiBearerAuth());
  }
}

function buildDecorators(options: ControllerDescribeOptions): (MethodDecorator | ClassDecorator)[] {
  const {
    method,
    path = '',
    summary,
    description,
    responseType,
    isPublic = false,
    errors = [],
  } = options;

  const decorators: (MethodDecorator | ClassDecorator)[] = [];
  decorators.push(METHOD_DECORATORS[method](path));

  const operationOptions = description !== undefined ? { summary, description } : { summary };
  decorators.push(ApiOperation(operationOptions));
  decorators.push(ApiResponse({ status: getSuccessStatus(method), type: responseType }));

  const allErrors = new Set([401, 403, ...errors]);
  addPublicDecorators(decorators, isPublic, allErrors);
  decorators.push(...getErrorDecorators([...allErrors]));

  return decorators;
}

export function ControllerDescribe(options: ControllerDescribeOptions): MethodDecorator {
  return applyDecorators(...buildDecorators(options));
}
