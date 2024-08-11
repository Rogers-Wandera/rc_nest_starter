import { Test, TestingModule } from '@nestjs/testing';
import { CoreControllerService } from './core-controller.service';

describe('CoreControllerService', () => {
  let service: CoreControllerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreControllerService],
    }).compile();

    service = module.get<CoreControllerService>(CoreControllerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
