## Title

FXQL Parser App

## Description

The FXQL Parser App is a NestJS-based application designed to process, validate, and store Foreign Exchange Query Language (FXQL) statements. It is built for Bureau De Change (BDC) operations to standardize and manage exchange rate information effectively.

## Features
- Accepts FXQL statements via a REST API.
- Parses and validates FXQL statements.
- Supports multiple FXQL statements in a single request.
- Stores validated statements in a PostgreSQL database.
- Provides comprehensive error messages with line numbers and character positions for invalid inputs.
- Enforces rate limiting to prevent abuse.
- Includes input sanitization for secure and clean data handling.
- Fully tested with unit and integration.

## Technology Stack
- Framework: NestJS
- Language: TypeScript
- Database: PostgreSQL
- Testing: Jest (unit and integration tests)

## Project setup

# Prerequisites
- Node.js (v16 or later)
- PostgreSQL (v12 or later)

# Steps
1. Clone the repository:
```bash
git clone https://github.com/thoraf20/fxql-parser.git
cd fxql-parser
```
2. Install dependencies:

```bash
$ npm install
```

3. Configure the environment variables:
- Create an .env file in the root directory:
  env
  Copy code:
```bash
DATABASE_URL=postgres://username:password@localhost:5432/fxql
PORT=3000
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=10
```
-Replace username and password with your PostgreSQL credentials.
- Adjust the port and rate limiting settings as needed.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

```

## API Endpoints
1. Submit FXQL Statements
POST /fxql

Request Body:
```json
{
  "FXQL": "USD-GBP {\n  BUY 0.85\n  SELL 0.90\n  CAP 10000\n}\n\nEUR-JPY {\n  BUY 145.20\n  SELL 146.50\n  CAP 50000\n}"
}
```

Responses:
- Success (201):
```json
{
  "message": "FXQL statements successfully processed.",
  "data": [
    {
      "sourceCurrency": "USD",
      "destinationCurrency": "GBP",
      "buyRate": 0.85,
      "sellRate": 0.9,
      "capAmount": 10000
    },
    {
      "sourceCurrency": "EUR",
      "destinationCurrency": "JPY",
      "buyRate": 145.2,
      "sellRate": 146.5,
      "capAmount": 50000
    }
  ]
}
```
- Error (400):
```json
{
  "statusCode": 400,
  "message": "Invalid FXQL syntax on line 1, character 7.",
  "code": "FXQL-400"
}
```

## Testing
# Run All Tests:
```bash
npm test
```

# Run Unit Tests:
```bash
npm run test:unit
```

- Run E2E Tests:
```bash
npm run test:e2e
```

## Scripts
- Start Development: npm run start:dev
- Start Production: npm run start:prod
- Build: npm run build


## Contact
 For questions or feedback, please contact:

- Email: thoraf20@gmil.com
- GitHub: thoraf20