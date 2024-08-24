import { DataSource, EntityManager, EntityMetadata } from 'typeorm';
import { CustomRepository } from '../ormextender/customrepository';
import { Request } from 'express';
import { mock } from 'jest-mock-extended';
import { UnauthorizedException } from '@nestjs/common';

describe('custom_repository', () => {
  let repository: CustomRepository<any>;
  let manager: EntityManager;
  let request: Request;
  const mockcols = ['id', 'name', 'creationDate'];

  beforeEach(async () => {
    const connection = {
      getMetadata: jest.fn().mockReturnValue({
        columns: [
          { propertyName: 'id' },
          { propertyName: 'name' },
          { propertyName: 'creationDate' },
        ],
      } as EntityMetadata),
    } as unknown as DataSource;
    manager = {
      connection,
    } as unknown as jest.Mocked<EntityManager>;

    request = mock<Request>();
    repository = new CustomRepository<any>({} as any, manager);
    repository.request = request;
  });

  it('should return entity columns', async () => {
    const result = await repository.getEntityColumns();
    expect(result).toEqual(mockcols);
  });

  it('should throw an error if conditions are not met in getEntityTotalDocs', async () => {
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
    } as any);

    const result = await repository.getEntityTotalDocs({ name: 'test' });
    expect(result).toEqual(1);
  });

  it('should throw UnauthorizedException in softDataDelete if no user is found', async () => {
    repository.request.user = undefined;
    await expect(repository.softDataDelete({ id: 1 })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
