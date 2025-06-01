/**
 * OpenAPI Schema Validator
 * 基於真實後端 OpenAPI schema 進行 contract testing
 */

import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import openApiSchema from "./openapi-schema.json";

export class SchemaValidator {
  private ajv: Ajv;
  private schemas: Record<string, any> = {};
  private paths: Record<string, any> = {};

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
    this.initializeSchemas();
  }

  private initializeSchemas() {
    // 註冊所有 component schemas
    if (openApiSchema.components?.schemas) {
      Object.entries(openApiSchema.components.schemas).forEach(([name, schema]) => {
        this.schemas[name] = schema;
        this.ajv.addSchema(schema, `#/components/schemas/${name}`);
      });
    }

    // 儲存 paths 資訊
    this.paths = openApiSchema.paths || {};
  }

  /**
   * 驗證請求資料是否符合 OpenAPI schema
   */
  validateRequest(path: string, method: string, data: any): { valid: boolean; errors?: ErrorObject[] } {
    const pathInfo = this.paths[path];
    if (!pathInfo || !pathInfo[method.toLowerCase()]) {
      return { valid: false, errors: [{ message: `Path ${method} ${path} not found in schema` } as ErrorObject] };
    }

    const operation = pathInfo[method.toLowerCase()];
    const requestBodySchema = operation.requestBody?.content?.["application/json"]?.schema;

    if (!requestBodySchema) {
      return { valid: true }; // No request body expected
    }

    const validate = this.ajv.compile(requestBodySchema);
    const valid = validate(data);

    return {
      valid,
      errors: valid ? undefined : (validate.errors || [])
    };
  }

  /**
   * 驗證回應資料是否符合 OpenAPI schema
   */
  validateResponse(path: string, method: string, statusCode: number, data: any): { valid: boolean; errors?: ErrorObject[] } {
    const pathInfo = this.paths[path];
    if (!pathInfo || !pathInfo[method.toLowerCase()]) {
      return { valid: false, errors: [{ message: `Path ${method} ${path} not found in schema` } as ErrorObject] };
    }

    const operation = pathInfo[method.toLowerCase()];
    const responseSchema = operation.responses?.[statusCode.toString()]?.content?.["application/json"]?.schema;

    if (!responseSchema) {
      return { valid: false, errors: [{ message: `No schema found for ${statusCode} response` } as ErrorObject] };
    }

    const validate = this.ajv.compile(responseSchema);
    const valid = validate(data);

    return {
      valid,
      errors: valid ? undefined : (validate.errors || [])
    };
  }

  /**
   * 獲取特定 schema 的驗證器
   */
  getSchemaValidator(schemaName: string) {
    const schema = this.schemas[schemaName];
    if (!schema) {
      throw new Error(`Schema ${schemaName} not found`);
    }
    return this.ajv.compile(schema);
  }

  /**
   * 驗證資料是否符合特定的 component schema
   */
  validateSchema(schemaName: string, data: any): { valid: boolean; errors?: ErrorObject[] } {
    try {
      const validate = this.getSchemaValidator(schemaName);
      const valid = validate(data);
      return {
        valid,
        errors: valid ? undefined : (validate.errors || [])
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{ message: (error as Error).message } as ErrorObject]
      };
    }
  }

  /**
   * 獲取所有可用的端點
   */
  getAvailableEndpoints(): Array<{ path: string; method: string; operationId: string }> {
    const endpoints: Array<{ path: string; method: string; operationId: string }> = [];
    
    Object.entries(this.paths).forEach(([path, pathItem]) => {
      Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
        if (operation.operationId) {
          endpoints.push({
            path,
            method: method.toUpperCase(),
            operationId: operation.operationId
          });
        }
      });
    });

    return endpoints;
  }
}

export const schemaValidator = new SchemaValidator(); 