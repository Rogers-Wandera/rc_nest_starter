import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.provider';

@Global()
@Module({
  providers: [
    {
      provide: 'data_source',
      useFactory: async () => {
        const datasource = new DatabaseService();
        await datasource.initialize();
        return datasource;
      },
    },
  ],
  exports: [
    {
      provide: 'data_source',
      useFactory: async () => {
        const datasource = new DatabaseService();
        await datasource.initialize();
        return datasource;
      },
    },
  ],
})
export class DatabaseModule {}
