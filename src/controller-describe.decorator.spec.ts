import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { ControllerDescribe } from './controller-describe.decorator';
import { IS_PUBLIC_KEY } from './types';
import type { HttpMethod } from './types';

class TestResponseDto {
  id!: string;
  name!: string;
}

describe('ControllerDescribe', () => {
  describe('HTTP method decorators', () => {
    it('should apply GET decorator for GET method', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          path: 'test',
          summary: 'Get test',
          responseType: TestResponseDto,
        })
        getTest(): void {}
      }

      const metadata = Reflect.getMetadata(METHOD_METADATA, TestController.prototype.getTest);
      const path = Reflect.getMetadata(PATH_METADATA, TestController.prototype.getTest);

      expect(metadata).toBe(0);
      expect(path).toBe('test');
    });

    it('should apply POST decorator for POST method', () => {
      class TestController {
        @ControllerDescribe({
          method: 'POST',
          path: 'create',
          summary: 'Create test',
          responseType: TestResponseDto,
        })
        createTest(): void {}
      }

      const metadata = Reflect.getMetadata(METHOD_METADATA, TestController.prototype.createTest);
      expect(metadata).toBe(1);
    });

    it('should apply PUT decorator for PUT method', () => {
      class TestController {
        @ControllerDescribe({
          method: 'PUT',
          path: 'update',
          summary: 'Update test',
          responseType: TestResponseDto,
        })
        updateTest(): void {}
      }

      const metadata = Reflect.getMetadata(METHOD_METADATA, TestController.prototype.updateTest);
      expect(metadata).toBe(2);
    });

    it('should apply PATCH decorator for PATCH method', () => {
      class TestController {
        @ControllerDescribe({
          method: 'PATCH',
          path: 'update',
          summary: 'Update test',
          responseType: TestResponseDto,
        })
        updateTest(): void {}
      }

      const metadata = Reflect.getMetadata(METHOD_METADATA, TestController.prototype.updateTest);
      expect(metadata).toBe(4);
    });

    it('should apply DELETE decorator for DELETE method', () => {
      class TestController {
        @ControllerDescribe({
          method: 'DELETE',
          path: 'remove',
          summary: 'Delete test',
          responseType: TestResponseDto,
        })
        removeTest(): void {}
      }

      const metadata = Reflect.getMetadata(METHOD_METADATA, TestController.prototype.removeTest);
      expect(metadata).toBe(3);
    });

    it('should handle empty path', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'Root endpoint',
          responseType: TestResponseDto,
        })
        root(): void {}
      }

      const path = Reflect.getMetadata(PATH_METADATA, TestController.prototype.root);
      expect(path).toBeDefined();
    });
  });

  describe('ApiOperation metadata', () => {
    it('should set ApiOperation summary', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'Test summary',
          responseType: TestResponseDto,
        })
        test(): void {}
      }

      const apiOperation = Reflect.getMetadata(
        DECORATORS.API_OPERATION,
        TestController.prototype.test,
      );

      expect(apiOperation?.summary).toBe('Test summary');
    });

    it('should set ApiOperation description when provided', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'Summary',
          description: 'Detailed description',
          responseType: TestResponseDto,
        })
        test(): void {}
      }

      const apiOperation = Reflect.getMetadata(
        DECORATORS.API_OPERATION,
        TestController.prototype.test,
      );

      expect(apiOperation?.description).toBe('Detailed description');
    });

    it('should not include description when not provided', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'Just summary',
          responseType: TestResponseDto,
        })
        test(): void {}
      }

      const apiOperation = Reflect.getMetadata(
        DECORATORS.API_OPERATION,
        TestController.prototype.test,
      );

      expect(apiOperation?.description).toBeUndefined();
    });
  });

  describe('ApiResponse metadata', () => {
    it('should set response metadata for GET', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'Get',
          responseType: TestResponseDto,
        })
        get(): void {}
      }

      const responses = Reflect.getMetadata(DECORATORS.API_RESPONSE, TestController.prototype.get);
      expect(responses).toBeDefined();
    });

    it('should set response metadata for POST', () => {
      class TestController {
        @ControllerDescribe({
          method: 'POST',
          summary: 'Create',
          responseType: TestResponseDto,
        })
        create(): void {}
      }

      const responses = Reflect.getMetadata(
        DECORATORS.API_RESPONSE,
        TestController.prototype.create,
      );
      expect(responses).toBeDefined();
    });

    it('should set response type', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'Get',
          responseType: TestResponseDto,
        })
        get(): void {}
      }

      const responses = Reflect.getMetadata(DECORATORS.API_RESPONSE, TestController.prototype.get);
      expect(responses).toBeDefined();
      const responseKeys = Object.keys(responses ?? {});
      expect(responseKeys.length).toBeGreaterThan(0);
    });
  });

  describe('ApiBearerAuth', () => {
    it('should add ApiBearerAuth when not public', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'Protected',
          responseType: TestResponseDto,
          isPublic: false,
        })
        protectedRoute(): void {}
      }

      const security = Reflect.getMetadata(
        DECORATORS.API_SECURITY,
        TestController.prototype.protectedRoute,
      );

      expect(security).toBeDefined();
      expect(security).toContainEqual({ bearer: [] });
    });

    it('should not add ApiBearerAuth when public', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'Public',
          responseType: TestResponseDto,
          isPublic: true,
        })
        publicRoute(): void {}
      }

      const security = Reflect.getMetadata(
        DECORATORS.API_SECURITY,
        TestController.prototype.publicRoute,
      );

      expect(security).toBeUndefined();
    });
  });

  describe('IS_PUBLIC_KEY metadata', () => {
    it('should set IS_PUBLIC_KEY when isPublic=true', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'Public endpoint',
          responseType: TestResponseDto,
          isPublic: true,
        })
        publicEndpoint(): void {}
      }

      const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, TestController.prototype.publicEndpoint);
      expect(isPublic).toBe(true);
    });

    it('should not set IS_PUBLIC_KEY when isPublic=false', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'Private endpoint',
          responseType: TestResponseDto,
          isPublic: false,
        })
        privateEndpoint(): void {}
      }

      const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, TestController.prototype.privateEndpoint);
      expect(isPublic).toBeUndefined();
    });

    it('should default isPublic to false', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'Default endpoint',
          responseType: TestResponseDto,
        })
        defaultEndpoint(): void {}
      }

      const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, TestController.prototype.defaultEndpoint);
      expect(isPublic).toBeUndefined();
    });
  });

  describe('error responses', () => {
    it('should add error responses for non-public routes', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'Protected',
          responseType: TestResponseDto,
        })
        protectedRoute(): void {}
      }

      const responses = Reflect.getMetadata(
        DECORATORS.API_RESPONSE,
        TestController.prototype.protectedRoute,
      );

      expect(responses).toBeDefined();
      expect(responses?.['401']).toBeDefined();
      expect(responses?.['403']).toBeDefined();
    });

    it('should not add 401 and 403 errors for public routes', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'Public',
          responseType: TestResponseDto,
          isPublic: true,
        })
        publicRoute(): void {}
      }

      const responses = Reflect.getMetadata(
        DECORATORS.API_RESPONSE,
        TestController.prototype.publicRoute,
      );

      expect(responses?.['401']).toBeUndefined();
      expect(responses?.['403']).toBeUndefined();
    });

    it('should add custom errors from errors array', () => {
      class TestController {
        @ControllerDescribe({
          method: 'GET',
          summary: 'With errors',
          responseType: TestResponseDto,
          errors: [404, 409],
        })
        withErrors(): void {}
      }

      const responses = Reflect.getMetadata(
        DECORATORS.API_RESPONSE,
        TestController.prototype.withErrors,
      );

      expect(responses?.['404']).toBeDefined();
      expect(responses?.['409']).toBeDefined();
    });
  });
});

describe('IS_PUBLIC_KEY', () => {
  it('should be exported as a constant', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});

describe('HttpMethod type', () => {
  it('should allow valid HTTP methods', () => {
    const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    expect(methods).toHaveLength(5);
  });
});
