import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuardsService } from './auth-guards.service';

describe('AuthGuardsService', () => {
  let service: AuthGuardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuardsService],
    }).compile();

    service = module.get<AuthGuardsService>(AuthGuardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
