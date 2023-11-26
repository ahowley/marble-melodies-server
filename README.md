# Marble Melodies (Server)

This is the server for (Marble Melodies)[https://github.com/ahowley/marble-melodies/tree/dev], a capstone project from
the September 2023 cohort of [BrainStation's](https://brainstation.io/) Software Engineering bootcamp. For more info,
see the (client repo here)[https://github.com/ahowley/marble-melodies/tree/dev].

## Server Installation

- Install dependencies:

```bash
npm i
```

- Create MySQL database:

```bash
mysql
```

```sql
CREATE DATABASE marble_melodies;
```

- Create and configure .env file based on .env.example
- Migrate tables

```bash
npm run migrate
```

- Seed tables

```bash
npm run seed
```

- Run development server (with ts-node & --watch)

```bash
npm run dev
```

- Build and run server

```bash
npm start
```

- Drop all tables from database

```bash
npm run rollback
```

## Tech Stack

- Node
- TypeScript
- Express
- Knex + MySQL

### App Dependencies

- express
- express-validator
- jsonwebtoken
- knex
- mysql2
- cors
- dotenv

### Dev Dependencies

- ts-node
- typescript
- @types/cors
- @types/express
- @types/express-validator
- @types/node
