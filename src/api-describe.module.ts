import { DynamicModule, Module } from '@nestjs/common';
import type { ApiDescribeModuleOptions } from './types';
import { API_DESCRIBE_OPTIONS } from './types';

@Module({})
export class ApiDescribeModule {
  static forRoot(options?: ApiDescribeModuleOptions): DynamicModule {
    return {
      module: ApiDescribeModule,
      global: true,
      providers: [{ provide: API_DESCRIBE_OPTIONS, useValue: options ?? {} }],
      exports: [API_DESCRIBE_OPTIONS],
    };
  }
}
