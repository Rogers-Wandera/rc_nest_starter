import { ModuleLink } from '@entity/entities/core/modulelinks.entity';

export type ModulesSchemaType = {
  name: string;
  position?: number;
};

export type Modulelinksschematype = Partial<ModuleLink>;
