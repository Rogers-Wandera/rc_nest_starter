import { Test, TestingModule } from '@nestjs/testing';
import { MaincoreService } from './maincore.service';

describe('MaincoreService', () => {
  let service: MaincoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaincoreService],
    }).compile();

    service = module.get<MaincoreService>(MaincoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
