import type { Type } from '@nestjs/common';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type DtoType =
  | 'string'
  | 'number'
  | 'int'
  | 'boolean'
  | 'uuid'
  | 'email'
  | 'date'
  | 'dateString'
  | 'url'
  | 'enum'
  | 'nested'
  | 'array'
  | 'object';

export interface ControllerDescribeOptions {
  method: HttpMethod;
  path?: string;
  summary: string;
  description?: string;
  responseType: Type<unknown>;
  isPublic?: boolean;
  errors?: number[];
}

export interface DtoDescribeOptions {
  description: string;
  example?: unknown;
  required?: boolean;
  type: DtoType;
  enum?: object;
  isArray?: boolean;
  nested?: Type<unknown>;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

export interface ApiDescribeModuleOptions {
  defaultErrors?: number[];
  customErrorDescriptions?: Record<number, string>;
}

export const IS_PUBLIC_KEY = 'isPublic';
export const API_DESCRIBE_OPTIONS = 'API_DESCRIBE_OPTIONS';
