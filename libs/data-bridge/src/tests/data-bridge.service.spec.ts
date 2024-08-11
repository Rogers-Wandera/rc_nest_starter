import { Test, TestingModule } from '@nestjs/testing';
import { DataBridgeService } from '../data-bridge.service';
import { BadRequestException } from '@nestjs/common';

describe('DataBridgeService', () => {
  let datasource: DataBridgeService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataBridgeService],
    }).compile();
    datasource = module.get<DataBridgeService>(DataBridgeService);
  });
  it('should be defined', () => {
    expect(datasource).toBeDefined();
  });
  it('should throw an error if model is not defined', () => {
    expect(() => {
      datasource.getModel(this);
    }).toThrow(BadRequestException);
  });
});
