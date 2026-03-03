import type { Type } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import type { ApiPropertyOptions } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type as ClassType } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import type { DtoDescribeOptions, DtoType } from './types';

function buildApiPropertyOptions(options: DtoDescribeOptions): ApiPropertyOptions {
  const apiOptions: ApiPropertyOptions = {
    description: options.description,
    required: options.required ?? true,
  };

  if (options.example !== undefined) {
    apiOptions.example = options.example;
  }

  if (options.isArray === true) {
    apiOptions.isArray = true;
  }

  if (options.type === 'enum' && options.enum !== undefined) {
    apiOptions.enum = options.enum;
  }

  if (options.nested !== undefined) {
    apiOptions.type = options.nested;
  }

  return apiOptions;
}

function getStringDecorators(options: DtoDescribeOptions): PropertyDecorator[] {
  const decorators: PropertyDecorator[] = [IsString()];

  if (options.minLength !== undefined || options.maxLength !== undefined) {
    decorators.push(Length(options.minLength ?? 0, options.maxLength));
  }

  decorators.push(
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string' ? value.trim() : value,
    ),
  );

  return decorators;
}

function getNumberDecorators(options: DtoDescribeOptions): PropertyDecorator[] {
  const decorators: PropertyDecorator[] = [IsNumber()];

  if (options.min !== undefined) {
    decorators.push(Min(options.min));
  }

  if (options.max !== undefined) {
    decorators.push(Max(options.max));
  }

  return decorators;
}

function getIntDecorators(options: DtoDescribeOptions): PropertyDecorator[] {
  const decorators: PropertyDecorator[] = [IsInt()];

  if (options.min !== undefined) {
    decorators.push(Min(options.min));
  }

  if (options.max !== undefined) {
    decorators.push(Max(options.max));
  }

  return decorators;
}

function getEmailDecorators(): PropertyDecorator[] {
  return [
    IsEmail(),
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string' ? value.toLowerCase().trim() : value,
    ),
  ];
}

function getNestedDecorators(nested: Type<unknown>): PropertyDecorator[] {
  return [ValidateNested(), ClassType(() => nested)];
}

function getArrayDecorators(nested?: Type<unknown>): PropertyDecorator[] {
  const decorators: PropertyDecorator[] = [IsArray()];

  if (nested !== undefined) {
    decorators.push(
      ValidateNested({ each: true }),
      ClassType(() => nested),
    );
  }

  return decorators;
}

const TYPE_DECORATOR_MAP: Record<DtoType, (options: DtoDescribeOptions) => PropertyDecorator[]> = {
  string: getStringDecorators,
  number: getNumberDecorators,
  int: getIntDecorators,
  boolean: () => [IsBoolean()],
  uuid: () => [IsUUID()],
  email: getEmailDecorators,
  date: () => [IsDate(), ClassType(() => Date)],
  dateString: () => [IsDateString()],
  url: () => [IsUrl()],
  enum: (opts) => (opts.enum !== undefined ? [IsEnum(opts.enum)] : []),
  nested: (opts) => (opts.nested !== undefined ? getNestedDecorators(opts.nested) : []),
  array: (opts) => getArrayDecorators(opts.nested),
  object: () => [IsObject()],
};

function getTypeDecorators(options: DtoDescribeOptions): PropertyDecorator[] {
  const decoratorFn = TYPE_DECORATOR_MAP[options.type];
  return decoratorFn(options);
}

export function DtoDescribe(options: DtoDescribeOptions): PropertyDecorator {
  const decorators: PropertyDecorator[] = [];

  decorators.push(ApiProperty(buildApiPropertyOptions(options)));

  const isRequired = options.required ?? true;
  decorators.push(isRequired ? IsNotEmpty() : IsOptional());
  decorators.push(...getTypeDecorators(options));

  if (options.pattern !== undefined) {
    decorators.push(Matches(options.pattern));
  }

  return applyDecorators(...decorators);
}
