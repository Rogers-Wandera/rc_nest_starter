export class CustomAppError extends Error {
  public readonly errorCode: number;
  public readonly name: string;
  public readonly details: object | string;
  constructor(
    message: string,
    errorCode: number = 500,
    details: object | string = {},
    name: string = 'CustomAppError',
  ) {
    super(message);
    this.name = name;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
    this.details = details;
  }

  public toJSON() {
    return {
      message: this.message,
      name: this.name,
      details: this.details,
    };
  }
}
