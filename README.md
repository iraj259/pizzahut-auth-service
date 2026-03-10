# PizzaHut Auth Service

A professional, multi-tenant authentication and authorization service built with **Node.js**, **Express**, **TypeScript**, and **TypeORM**. This service handles user registration, login, role-based access control, and tenant management.

## 🛠️ Tech Stack

This project leverages a modern and robust tech stack for scalability, security, and developer productivity:

- **Runtime Environment**: [Node.js](https://nodejs.org/) (v16+)
- **Web Framework**: [Express.js](https://expressjs.com/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/) for static typing and better developer experience.
- **ORM (Object-Relational Mapper)**: [TypeORM](https://typeorm.io/) for interacting with the database using an active record or data mapper pattern.
- **Database**: [PostgreSQL](https://www.postgresql.org/) for reliable, relational data storage.
- **Authentication**: 
  - [JSON Web Tokens (JWT)](https://jwt.io/) for secure session management.
  - `rsa-pem-to-jwk` for handling RSA keys and JWKS.
  - `cookie-parser` for secure cookie management.
- **Security**: 
  - `bcrypt` for secure password hashing.
  - `express-jwt` and `jwks-rsa` for token verification.
- **Request Validation**: [express-validator](https://express-validator.github.io/docs/) for strict input validation.
- **Logging**: [Winston](https://github.com/winstonjs/winston) for structured and multi-transport logging.
- **Testing**:
  - [Jest](https://jestjs.io/) as the test runner.
  - [Supertest](https://github.com/visionmedia/supertest) for integration testing of HTTP endpoints.
  - `mock-jwks` for simulating authentication in tests.
- **Development Tools**: 
  - `nodemon` for automatic server restarts.
  - `ts-node` for running TypeScript directly.
  - `eslint` and `prettier` for code quality and formatting.
  - `husky` and `lint-staged` for git hooks.

## 🚀 Features

- **Multi-tenancy**: Support for multiple tenants with isolated data.
- **Authentication**: JWT-based authentication with Access and Refresh tokens.
- **Security**: 
  - Dynamic **JWKS** (JSON Web Key Set) for public key distribution.
  - Password hashing with **Bcrypt**.
  - **CSRF** protection via Secure/HttpOnly cookies.
- **Authorization**: Role-based access control (RBAC) with specific permissions (e.g., Admin, Customer).
- **Validation**: Strict request data validation using `express-validator`.
- **Logging**: Comprehensive logging system using **Winston**.
- **Testing**: Robust integration tests using **Jest** and **Supertest**.
- **Migrations**: Database schema management with TypeORM migrations.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [PostgreSQL](https://www.postgresql.org/)
- [npm](https://www.npmjs.com/)

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iraj259/pizzahut-auth-service.git
   cd pizzahut-auth-service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.dev` file in the root directory and configure the following variables (see `.env.example` for reference):
   ```env
   PORT=5555
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=auth_service
   REFRESH_TOKEN_SECRET=your_secret_key
   JWKS_URI=http://localhost:5555/.well-known/jwks.json
   PRIVATE_KEY=your_private_key_content
   ```

4. **Certificates:**
   Place your RSA private key in `certs/private.pem` for JWKS support.

5. **Run Migrations:**
   ```bash
   npm run migration:run
   ```

## 🏃 Running the Application

- **Development Mode:**
  ```bash
  npm run dev
  ```

- **Build for Production:**
  ```bash
  npm run build
  ```

- **Linting & Formatting:**
  ```bash
  npm run lint
  npm run format:fix
  ```

## 🧪 Testing

Run the test suite using Jest:
```bash
npm run test
```

## 📂 Project Structure

```text
├── src
│   ├── config        # Database, Logger, and App config
│   ├── controllers   # Request handlers (logic layer)
│   ├── entity        # TypeORM entities (models)
│   ├── middlewares   # Custom Express middlewares
│   ├── migration     # Database migrations
│   ├── routes        # API route definitions
│   ├── services      # Business logic layer
│   ├── types         # TypeScript interfaces and types
│   ├── validators    # Request validation schemas
│   └── app.ts        # Express app initialization
├── tests             # Integration and Unit tests
├── certs             # RSA certificates for JWT signing
├── docker            # Docker configuration files
└── package.json      # Dependencies and scripts
```

## 📡 API Endpoints (Quick Reference)

### Auth
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `GET /auth/self` - Get current profile
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /.well-known/jwks.json` - Get public keys for token verification

### Tenants
- `POST /tenant` - Create a new tenant (Admin only)
- `GET /tenant` - List all tenants
- `GET /tenant/:id` - Get tenant by ID (Admin only)
- `DELETE /tenant/:id` - Delete a tenant (Admin only)

### Users
- `POST /user` - Create a new user (Admin only)
- `PATCH /user/:id` - Update user details (Admin only)

## 🐳 Docker Support

To run the application using Docker:
```bash
docker build -t pizzahut-auth-service -f docker/prod/Dockerfile .
docker run -p 5555:5555 pizzahut-auth-service
```

## 📝 License
This project is licensed under the ISC License.
