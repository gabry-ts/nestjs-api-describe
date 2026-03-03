import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { ApiDescribeModule } from './api-describe.module';
import { API_DESCRIBE_OPTIONS } from './types';

describe('ApiDescribeModule', () => {
  it('should create module with forRoot() without options', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ApiDescribeModule.forRoot()],
    }).compile();

    const options = moduleRef.get(API_DESCRIBE_OPTIONS);
    expect(options).toEqual({});
  });

  it('should create module with forRoot() with options', async () => {
    const moduleOptions = {
      defaultErrors: [400, 500],
      customErrorDescriptions: { 400: 'Custom Bad Request' },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [ApiDescribeModule.forRoot(moduleOptions)],
    }).compile();

    const options = moduleRef.get(API_DESCRIBE_OPTIONS);
    expect(options).toEqual(moduleOptions);
  });

  it('should return a dynamic module with global scope', () => {
    const dynamicModule = ApiDescribeModule.forRoot();

    expect(dynamicModule.global).toBe(true);
    expect(dynamicModule.module).toBe(ApiDescribeModule);
  });

  it('should export API_DESCRIBE_OPTIONS provider', () => {
    const dynamicModule = ApiDescribeModule.forRoot();

    expect(dynamicModule.exports).toContain(API_DESCRIBE_OPTIONS);
  });
});
