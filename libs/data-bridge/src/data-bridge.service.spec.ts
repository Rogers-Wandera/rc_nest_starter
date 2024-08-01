import { Test, TestingModule } from '@nestjs/testing';
import { DataBridgeService } from './data-bridge.service';

describe('DataBridgeService', () => {
  let service: DataBridgeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataBridgeService],
    }).compile();

    service = module.get<DataBridgeService>(DataBridgeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
