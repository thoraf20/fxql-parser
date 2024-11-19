import { Test, TestingModule } from '@nestjs/testing';
import { FxqlController } from './fxql.controller';

describe('FxqlController', () => {
  let controller: FxqlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FxqlController],
    }).compile();

    controller = module.get<FxqlController>(FxqlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
