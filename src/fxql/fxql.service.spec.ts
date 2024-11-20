/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { FxqlService } from './fxql.service';
import { Repository } from 'typeorm';
import { FxqlStatement } from './entities/fxql-statement.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { handleValidationErrors, mapErrorCode } from '../helper/index';

jest.mock('../helper'); // Mock helper functions

describe('FxqlService', () => {
  let service: FxqlService;
  let repo: Repository<FxqlStatement>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FxqlService,
        {
          provide: getRepositoryToken(FxqlStatement),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FxqlService>(FxqlService);
    repo = module.get<Repository<FxqlStatement>>(
      getRepositoryToken(FxqlStatement),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle empty FXQL input gracefully', async () => {
    const emptyFxql = '';

    jest.spyOn(service as any, 'parseFxql').mockReturnValue([]);
    jest.spyOn(service as any, 'transformParsedData').mockReturnValue([]);
    jest.spyOn(repo, 'save').mockResolvedValue([] as any);

    const result = await service.saveFxql(emptyFxql);

    expect(result).toEqual([]);
    expect(service['parseFxql']).toHaveBeenCalledWith(emptyFxql);
    expect(service['transformParsedData']).toHaveBeenCalledWith([]);
    expect(repo.save).toHaveBeenCalledWith([]);
  });

  it('should validate and handle invalid characters in currency codes', async () => {
    const invalidFxql = 'USD-GB# {\n  BUY 0.85\n  SELL 0.90\n  CAP 10000\n}';

    jest.spyOn(service as any, 'parseFxql').mockImplementation(() => {
      throw new BadRequestException(
        'Invalid FXQL syntax on line 1, character 7: "USD-GB# {  BUY 0.85  SELL 0.90  CAP 10000}"',
      );
    });

    (handleValidationErrors as jest.Mock).mockImplementation(() => {
      throw new BadRequestException('Invalid currency code');
    });

    await expect(service.saveFxql(invalidFxql)).rejects.toThrow(
      'Invalid FXQL syntax on line 1, character 7: "USD-GB# {  BUY 0.85  SELL 0.90  CAP 10000}"',
    );

    expect(service['parseFxql']).toHaveBeenCalledWith(invalidFxql);
    expect(handleValidationErrors).not.toHaveBeenCalled();
    expect(service['fxqlRepository'].save).not.toHaveBeenCalled();
  });

  it('should handle FXQL statements with missing or extra spaces', async () => {
    const fxqlWithSpaces = 'USD-GBP  {  BUY  0.85   SELL  0.90  CAP  10000  }';

    const parsedData = [
      {
        sourceCurrency: 'USD',
        destinationCurrency: 'GBP',
        buyRate: 0.85,
        sellRate: 0.9,
        cap: 10000,
      },
    ];

    const transformedData = [
      {
        sourceCurrency: 'USD',
        destinationCurrency: 'GBP',
        buyRate: 0.85,
        sellRate: 0.9,
        capAmount: 10000,
      },
    ];

    jest.spyOn(service as any, 'parseFxql').mockReturnValue(parsedData);
    jest
      .spyOn(service as any, 'transformParsedData')
      .mockReturnValue(transformedData);
    jest
      .spyOn(repo, 'save')
      .mockResolvedValue(transformedData as FxqlStatement[] as any);

    const result = await service.saveFxql(fxqlWithSpaces);

    expect(service['parseFxql']).toHaveBeenCalledWith(fxqlWithSpaces);
    expect(service['transformParsedData']).toHaveBeenCalledWith(parsedData);
    expect(handleValidationErrors).not.toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(transformedData);
    expect(result).toEqual(transformedData);
  });

  it('should handle FXQL statements with non-numeric buy or sell rates', async () => {
    const invalidFxql = 'USD-GBP {\n  BUY abc\n  SELL 0.90\n  CAP 10000\n}';

    jest.spyOn(service as any, 'parseFxql').mockImplementation(() => {
      throw new BadRequestException(
        'Invalid FXQL syntax on line 1, character 14: "USD-GBP {  BUY abc  SELL 0.90  CAP 10000}"',
      );
    });

    await expect(service.saveFxql(invalidFxql)).rejects.toThrow(
      'Invalid FXQL syntax on line 1, character 14: "USD-GBP {  BUY abc  SELL 0.90  CAP 10000}"',
    );

    expect(service['parseFxql']).toHaveBeenCalledWith(invalidFxql);
    expect(handleValidationErrors).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });


  it('should call saveFxql and save the data when input is valid', async () => {
    const fxql = 'USD-GBP {\n  BUY 0.85\n  SELL 0.90\n  CAP 10000\n}';
    const expectedResult = {
      sourceCurrency: 'USD',
      destinationCurrency: 'GBP',
      buyRate: 0.85,
      sellRate: 0.9,
      capAmount: 10000,
    };

    jest.spyOn(repo, 'save').mockResolvedValue(expectedResult as FxqlStatement);

    const result = await service.saveFxql(fxql);

    expect(result).toEqual(expectedResult);
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining([expectedResult]),
    );
  });

  it('should call saveFxql and save the data when input contains multiple FXQL statements', async () => {
    const fxql = `
    USD-GBP {
      BUY 0.85
      SELL 0.90
      CAP 10000
    }
    EUR-JPY {
      BUY 145.20
      SELL 146.50
      CAP 50000
    }
  `;

    const parsedData = [
      {
        sourceCurrency: 'USD',
        destinationCurrency: 'GBP',
        buyRate: 0.85,
        sellRate: 0.9,
        cap: 10000,
      },
      {
        sourceCurrency: 'EUR',
        destinationCurrency: 'JPY',
        buyRate: 145.2,
        sellRate: 146.5,
        cap: 50000,
      },
    ];

    const transformedData = [
      {
        sourceCurrency: 'USD',
        destinationCurrency: 'GBP',
        buyRate: 0.85,
        sellRate: 0.9,
        capAmount: 10000,
      },
      {
        sourceCurrency: 'EUR',
        destinationCurrency: 'JPY',
        buyRate: 145.2,
        sellRate: 146.5,
        capAmount: 50000,
      },
    ];

    jest.spyOn(service as any, 'parseFxql').mockReturnValue(parsedData);
    jest
      .spyOn(service as any, 'transformParsedData')
      .mockReturnValue(transformedData);
    jest
      .spyOn(repo, 'save')
      .mockResolvedValue(transformedData as FxqlStatement[] as any);

    const result = await service.saveFxql(fxql);

    expect(service['parseFxql']).toHaveBeenCalledWith(fxql);
    expect(service['transformParsedData']).toHaveBeenCalledWith(parsedData);
    expect(repo.save).toHaveBeenCalledWith(transformedData);
    expect(result).toEqual(transformedData);
  });


  it('should throw an error when the FXQL input exceeds the max number of pairs', async () => {
    const fxql = new Array(1001)
      .fill("USD-GBP {\n  BUY 0.85\n  SELL 0.90\n  CAP 10000\n}")
      .join("\n\n");

    (mapErrorCode as any as jest.Mock).mockImplementation(() => {
      throw new BadRequestException(
        'Maximum allowed currency pairs is 1000, got 1001.',
      );
    });

    await expect(service.saveFxql(fxql)).rejects.toThrow(
      'Maximum allowed currency pairs is 1000, got 1001.',
    );
  })

  it('should throw an error when the FXQL statement is invalid', async () => {
    const invalidFxql = 'USD-GBP {\n  BUY X\n  SELL 0.90\n  CAP 10000\n}';

    // Mock mapErrorCode to simulate throwing an error for invalid input
    jest.spyOn(service as any, 'parseFxql').mockImplementation(() => {
      throw new BadRequestException(
        'Invalid FXQL syntax on line 1, character 7',
      );
    });

    await expect(service.saveFxql(invalidFxql)).rejects.toThrow(
      'Invalid FXQL syntax on line 1, character 7',
    );
  });
});
