import { ObjectSchema } from 'joi';
import { paginateprops } from 'src/app/conn/conntypes';
import { CustomAppError } from 'src/app/context/app.error';
import { PaginationSchema } from 'src/schemas/core/paginate.schema';

type Constructor<T> = new (...args: object[]) => T;
type schema<R> = ObjectSchema<R>;

type body<R> = R;

// type M<R> = R;

type validatetypes = 'params' | 'body';

export abstract class MainController<T> {
  private schema: schema<unknown>;
  protected model: T;
  private body: body<unknown>;
  constructor(Model: Constructor<T>) {
    this.model = this.modelInstance(Model);
  }

  protected setSchema<R>(schema: schema<R>) {
    this.schema = schema;
  }

  private getSchema<R>(): schema<R> {
    return this.schema as schema<R>;
  }

  private modelInstance(Model: Constructor<T>): T {
    return new Model();
  }

  private async validateBodySchema<R>(
    validateData: Partial<R>,
    contextData: unknown = null,
  ) {
    try {
      const context = {};
      const schema = this.getSchema<R>();
      if (!schema) {
        throw new CustomAppError('Schema not found', 400);
      }
      if (contextData) {
        if (!Array.isArray(contextData)) {
          throw new CustomAppError('contextData must be an array', 400);
        }
        contextData.forEach((data) => {
          context[data] = validateData[data];
        });
      }
      const validationOptions = contextData
        ? { abortEarly: false, context }
        : { abortEarly: false };
      const data: body<R> = await schema.validateAsync(
        validateData,
        validationOptions,
      );
      this.body = data;
    } catch (error) {
      throw new CustomAppError(error.message, 400);
    }
  }

  private validateParams<R>(params: R) {
    const schema = this.getSchema<R>();
    if (!schema) {
      throw new Error('Schema not found');
    }
    const validate = schema.validate(params, { abortEarly: false });
    if (validate.error) {
      throw new CustomAppError(
        validate.error.message,
        400,
        validate.error.details,
        'ValidationError',
      );
    }
    this.body = validate.value as R;
  }

  protected async Validate<R>(validateData: {
    type: validatetypes;
    schema: schema<R>;
    data: unknown;
    context?: unknown;
  }) {
    const { data, context, type, schema } = validateData;
    this.setSchema(schema);
    try {
      if (type === 'body') {
        await this.validateBodySchema(data, context);
      } else {
        this.validateParams(data);
      }
      return this.body as R;
    } catch (err) {
      throw err;
    }
  }

  protected async validatePagination<R>(entity: Constructor<R>, data: unknown) {
    try {
      const schema = PaginationSchema<R>(entity);
      const params = await this.Validate<paginateprops<R>>({
        type: 'params',
        data: data,
        schema: schema,
      });
      return params;
    } catch (err) {
      throw err;
    }
  }
}
