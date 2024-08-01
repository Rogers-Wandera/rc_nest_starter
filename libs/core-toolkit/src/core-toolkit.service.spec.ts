import { Test, TestingModule } from '@nestjs/testing';
import { CoreToolkitService } from './core-toolkit.service';

describe('CoreToolkitService', () => {
  let service: CoreToolkitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreToolkitService],
    }).compile();

    service = module.get<CoreToolkitService>(CoreToolkitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
