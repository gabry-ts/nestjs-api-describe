import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { DtoDescribe } from './dto-describe.decorator';
import type { DtoType } from './types';

describe('DtoDescribe', () => {
  describe('ApiProperty', () => {
    it('should apply ApiProperty with description', () => {
      class TestDto {
        @DtoDescribe({
          description: 'Test field description',
          type: 'string',
        })
        field!: string;
      }

      const metadata = Reflect.getMetadata(
        DECORATORS.API_MODEL_PROPERTIES,
        TestDto.prototype,
        'field',
      );

      expect(metadata).toBeDefined();
      expect(metadata?.description).toBe('Test field description');
    });

    it('should apply ApiProperty with example', () => {
      class TestDto {
        @DtoDescribe({
          description: 'Field with example',
          type: 'string',
          example: 'example value',
        })
        field!: string;
      }

      const metadata = Reflect.getMetadata(
        DECORATORS.API_MODEL_PROPERTIES,
        TestDto.prototype,
        'field',
      );

      expect(metadata?.example).toBe('example value');
    });
  });

  describe('required validation', () => {
    it('should apply IsNotEmpty when required=true (default)', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Required field',
          type: 'string',
        })
        field!: string;
      }

      const instance = plainToInstance(TestDto, { field: '' });
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should apply IsOptional when required=false', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Optional field',
          type: 'string',
          required: false,
        })
        field?: string;
      }

      const instance = plainToInstance(TestDto, {});
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
    });
  });

  describe('string type', () => {
    it('should apply IsString validator', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'String field',
          type: 'string',
        })
        field!: string;
      }

      const instance = plainToInstance(TestDto, { field: 123 });
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should apply Length constraints', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Length constrained',
          type: 'string',
          minLength: 2,
          maxLength: 10,
        })
        field!: string;
      }

      const tooShort = plainToInstance(TestDto, { field: 'A' });
      const tooLong = plainToInstance(TestDto, { field: 'A'.repeat(11) });
      const valid = plainToInstance(TestDto, { field: 'Valid' });

      const shortErrors = await validate(tooShort);
      const longErrors = await validate(tooLong);
      const validErrors = await validate(valid);

      expect(shortErrors.length).toBeGreaterThan(0);
      expect(longErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });

    it('should trim string values', () => {
      class TestDto {
        @DtoDescribe({
          description: 'Trimmed field',
          type: 'string',
        })
        field!: string;
      }

      const instance = plainToInstance(TestDto, { field: '  trimmed  ' });

      expect(instance.field).toBe('trimmed');
    });
  });

  describe('number type', () => {
    it('should apply IsNumber validator', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Number field',
          type: 'number',
        })
        field!: number;
      }

      const instance = plainToInstance(TestDto, { field: 'not a number' });
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should apply Min constraint', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Min constrained',
          type: 'number',
          min: 0,
        })
        field!: number;
      }

      const invalid = plainToInstance(TestDto, { field: -1 });
      const valid = plainToInstance(TestDto, { field: 0 });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });

    it('should apply Max constraint', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Max constrained',
          type: 'number',
          max: 100,
        })
        field!: number;
      }

      const invalid = plainToInstance(TestDto, { field: 101 });
      const valid = plainToInstance(TestDto, { field: 100 });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });
  });

  describe('int type', () => {
    it('should apply IsInt validator', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Integer field',
          type: 'int',
        })
        field!: number;
      }

      const invalid = plainToInstance(TestDto, { field: 1.5 });
      const valid = plainToInstance(TestDto, { field: 5 });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });

    it('should apply Min constraint for int', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Min int',
          type: 'int',
          min: 1,
        })
        field!: number;
      }

      const invalid = plainToInstance(TestDto, { field: 0 });
      const valid = plainToInstance(TestDto, { field: 1 });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });

    it('should apply Max constraint for int', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Max int',
          type: 'int',
          max: 10,
        })
        field!: number;
      }

      const invalid = plainToInstance(TestDto, { field: 11 });
      const valid = plainToInstance(TestDto, { field: 10 });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });
  });

  describe('boolean type', () => {
    it('should apply IsBoolean validator', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Boolean field',
          type: 'boolean',
        })
        field!: boolean;
      }

      const instance = plainToInstance(TestDto, { field: 'not a boolean' });
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept true and false', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Boolean field',
          type: 'boolean',
        })
        field!: boolean;
      }

      const trueInstance = plainToInstance(TestDto, { field: true });
      const falseInstance = plainToInstance(TestDto, { field: false });

      const trueErrors = await validate(trueInstance);
      const falseErrors = await validate(falseInstance);

      expect(trueErrors.length).toBe(0);
      expect(falseErrors.length).toBe(0);
    });
  });

  describe('uuid type', () => {
    it('should apply IsUUID validator', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'UUID field',
          type: 'uuid',
        })
        field!: string;
      }

      const invalid = plainToInstance(TestDto, { field: 'not-a-uuid' });
      const valid = plainToInstance(TestDto, { field: '550e8400-e29b-41d4-a716-446655440000' });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });
  });

  describe('email type', () => {
    it('should apply IsEmail validator', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Email field',
          type: 'email',
        })
        field!: string;
      }

      const invalid = plainToInstance(TestDto, { field: 'not-an-email' });
      const valid = plainToInstance(TestDto, { field: 'test@example.com' });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });

    it('should lowercase and trim email', () => {
      class TestDto {
        @DtoDescribe({
          description: 'Email field',
          type: 'email',
        })
        field!: string;
      }

      const instance = plainToInstance(TestDto, { field: '  TEST@EXAMPLE.COM  ' });

      expect(instance.field).toBe('test@example.com');
    });
  });

  describe('url type', () => {
    it('should apply IsUrl validator', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'URL field',
          type: 'url',
        })
        field!: string;
      }

      const invalid = plainToInstance(TestDto, { field: 'not-a-url' });
      const valid = plainToInstance(TestDto, { field: 'https://example.com' });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });
  });

  describe('dateString type', () => {
    it('should apply IsDateString validator', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Date string field',
          type: 'dateString',
        })
        field!: string;
      }

      const invalid = plainToInstance(TestDto, { field: 'not-a-date' });
      const valid = plainToInstance(TestDto, { field: '2024-01-15T10:30:00.000Z' });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });
  });

  describe('enum type', () => {
    enum TestEnum {
      VALUE_A = 'a',
      VALUE_B = 'b',
    }

    it('should apply IsEnum validator', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Enum field',
          type: 'enum',
          enum: TestEnum,
        })
        field!: TestEnum;
      }

      const invalid = plainToInstance(TestDto, { field: 'invalid' });
      const valid = plainToInstance(TestDto, { field: 'a' });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });
  });

  describe('array type', () => {
    it('should apply IsArray validator', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Array field',
          type: 'array',
        })
        field!: string[];
      }

      const invalid = plainToInstance(TestDto, { field: 'not-an-array' });
      const valid = plainToInstance(TestDto, { field: ['a', 'b'] });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });
  });

  describe('object type', () => {
    it('should apply IsObject validator', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Object field',
          type: 'object',
        })
        field!: Record<string, unknown>;
      }

      const invalid = plainToInstance(TestDto, { field: 'not-an-object' });
      const valid = plainToInstance(TestDto, { field: { key: 'value' } });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });

    it('should reject arrays for object type', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Object field',
          type: 'object',
        })
        field!: Record<string, unknown>;
      }

      const instance = plainToInstance(TestDto, { field: [1, 2, 3] });
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('pattern validation', () => {
    it('should apply Matches validator for pattern', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Pattern field',
          type: 'string',
          pattern: /^[A-Z]{3}$/,
        })
        field!: string;
      }

      const invalid = plainToInstance(TestDto, { field: 'abc' });
      const valid = plainToInstance(TestDto, { field: 'ABC' });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });
  });

  describe('nested type', () => {
    class NestedDto {
      @DtoDescribe({
        description: 'Nested value',
        type: 'string',
      })
      value!: string;
    }

    it('should apply ValidateNested for nested objects', async () => {
      class TestDto {
        @DtoDescribe({
          description: 'Nested field',
          type: 'nested',
          nested: NestedDto,
        })
        field!: NestedDto;
      }

      const invalid = plainToInstance(TestDto, { field: { value: 123 } });
      const valid = plainToInstance(TestDto, { field: { value: 'test' } });

      const invalidErrors = await validate(invalid);
      const validErrors = await validate(valid);

      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(validErrors.length).toBe(0);
    });
  });
});

describe('DtoType', () => {
  it('should support all expected types', () => {
    const types: DtoType[] = [
      'string',
      'number',
      'int',
      'boolean',
      'uuid',
      'email',
      'date',
      'dateString',
      'url',
      'enum',
      'nested',
      'array',
      'object',
    ];

    expect(types).toHaveLength(13);
  });
});
