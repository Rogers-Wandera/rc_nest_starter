import { ModuleLink } from 'src/entity/core/modulelinks.entity';

export type ModulesSchemaType = {
  name: string;
  position?: number;
};

export type Modulelinksschematype = Partial<ModuleLink>;
