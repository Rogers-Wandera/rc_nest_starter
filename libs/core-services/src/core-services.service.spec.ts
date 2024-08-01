import { Test, TestingModule } from '@nestjs/testing';
import { CoreServicesService } from './core-services.service';

describe('CoreServicesService', () => {
  let service: CoreServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreServicesService],
    }).compile();

    service = module.get<CoreServicesService>(CoreServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
