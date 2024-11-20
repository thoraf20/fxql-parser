/* eslint-disable prettier/prettier */
// /* eslint-disable prettier/prettier */
// import { Test, TestingModule } from '@nestjs/testing';
// import { FxqlService } from '../src/fxql/fxql.service';
// import { Repository } from 'typeorm';
// import { FxqlStatement } from '../src/fxql/entities/fxql-statement.entity';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { BadRequestException } from '@nestjs/common';
// // import { handleValidationErrors, mapErrorCode } from '../src/helper';
// import { TypeOrmModule } from '@nestjs/typeorm';

// jest.mock('../src/helper'); // Mock helper functions

// describe('FxqlService Integration', () => {
//   let service: FxqlService;
//   let repo: Repository<FxqlStatement>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [
//         TypeOrmModule.forRoot({
//           type: 'sqlite',
//           database: ':memory:',
//           entities: [FxqlStatement],
//           synchronize: true,
//         }),
//         TypeOrmModule.forFeature([FxqlStatement]),
//       ],
//       providers: [FxqlService],
//     }).compile();

//     service = module.get<FxqlService>(FxqlService);
//     repo = module.get<Repository<FxqlStatement>>(
//       getRepositoryToken(FxqlStatement),
//     );
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   it('should save multiple FXQL statements to the database', async () => {
//     const fxql = `
//       USD-GBP {
//       BUY 0.85
//       SELL 0.90
//       CAP 10000
//       }
//       EUR-JPY {
//       BUY 145.20
//       SELL 146.50
//       CAP 50000
//       }
//     `;

//     const result = await service.saveFxql(fxql);

//     expect(result).toHaveLength(2);
//     expect(result[0]).toEqual(
//       expect.objectContaining({
//         sourceCurrency: 'USD',
//         destinationCurrency: 'GBP',
//         buyRate: 0.85,
//         sellRate: 0.9,
//         capAmount: 10000,
//       }),
//     );
//     expect(result[1]).toEqual(
//       expect.objectContaining({
//         sourceCurrency: 'EUR',
//         destinationCurrency: 'JPY',
//         buyRate: 145.2,
//         sellRate: 146.5,
//         capAmount: 50000,
//       }),
//     );

//     const savedStatements = await repo.find();
//     expect(savedStatements).toHaveLength(2);
//     expect(savedStatements[0]).toEqual(
//       expect.objectContaining({
//         sourceCurrency: 'USD',
//         destinationCurrency: 'GBP',
//         buyRate: 0.85,
//         sellRate: 0.9,
//         capAmount: 10000,
//       }),
//     );
//     expect(savedStatements[1]).toEqual(
//       expect.objectContaining({
//         sourceCurrency: 'EUR',
//         destinationCurrency: 'JPY',
//         buyRate: 145.2,
//         sellRate: 146.5,
//         capAmount: 50000,
//       }),
//     );
//   });

//   it('should throw BadRequestException for invalid FXQL syntax', async () => {
//     const invalidFxql = 'USD-GBP { BUY 0.85 SELL 0.90 CAP invalid }';

//     await expect(service.saveFxql(invalidFxql)).rejects.toThrow(
//       BadRequestException,
//     );
//   });

//   it('should throw BadRequestException when exceeding maximum allowed pairs', async () => {
//     const maxPairs = 1000;
//     const exceededFxql = Array(maxPairs + 1)
//       .fill('USD-GBP { BUY 0.85 SELL 0.90 CAP 10000 }')
//       .join('\n\n');

//     await expect(service.saveFxql(exceededFxql)).rejects.toThrow(
//       BadRequestException,
//     );
//   });

//   it('should handle empty FXQL input', async () => {
//     const emptyFxql = '';

//     const result = await service.saveFxql(emptyFxql);

//     expect(result).toEqual([]);
//   });

//   it('should handle FXQL statements with missing or extra spaces', async () => {
//     const fxqlWithSpaces = 'USD-GBP  {  BUY  0.85   SELL  0.90  CAP  10000  }';

//     const result = await service.saveFxql(fxqlWithSpaces);

//     expect(result).toHaveLength(1);
//     expect(result[0]).toEqual(
//       expect.objectContaining({
//         sourceCurrency: 'USD',
//         destinationCurrency: 'GBP',
//         buyRate: 0.85,
//         sellRate: 0.9,
//         capAmount: 10000,
//       }),
//     );
//   });

//   afterEach(async () => {
//     await repo.clear();
//   });
// });



import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('FxqlController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Import the entire application module
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/fxql (POST) - should process a valid FXQL input', async () => {
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

    const response = await request(app.getHttpServer())
      .post('/fxql')
      .send({ FXQL: fxql })
      .expect(201);

    expect(response.body.message).toBe(
      'FXQL statements successfully processed.',
    );
    
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceCurrency: 'USD',
          destinationCurrency: 'GBP',
          buyRate: 0.85,
          sellRate: 0.9,
          capAmount: 10000,
        }),
        expect.objectContaining({
          sourceCurrency: 'EUR',
          destinationCurrency: 'JPY',
          buyRate: 145.2,
          sellRate: 146.5,
          capAmount: 50000,
        }),
      ]),
    );
  });

  it('/fxql (POST) - should return error for invalid FXQL input', async () => {
    const fxql = `
      USD-GBP {
        BUY INVALID
        SELL 0.90
        CAP 10000
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/fxql')
      .send({ FXQL: fxql })
      .expect(400);

    expect(response.body.message).toContain('Invalid FXQL syntax');
  });
});

