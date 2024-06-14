import { DataSourceOptions, ObjectLiteral } from 'typeorm';
import { DataExtenderBuilder } from '../app/conn/extenderbuilder';
import {
  PaginationResults,
  customquerypaginateprops,
} from '../app/conn/conntypes';

export class Model extends DataExtenderBuilder {
  constructor(options: DataSourceOptions) {
    super(options);
  }
  public async __viewCustomPaginateData<T extends ObjectLiteral>(
    paginateprops: customquerypaginateprops<T>,
  ): Promise<PaginationResults<T>> {
    try {
      const data = await this.customQueryPaginate(paginateprops);
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
