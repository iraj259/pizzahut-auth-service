import { DataSource } from "typeorm";
import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";

describe("POST /auth/login", () => {
  let connection: DataSource;

  beforeAll(async () => {
    try {
      connection = await AppDataSource.initialize();
    } catch (err) {
      console.error("Database initialization failed:", err);
      throw err;
    }
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should login the user", async () => {
      // create user first
      await request(app).post("/auth/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        password: "password123",
      });

      const response = await request(app).post("/auth/login").send({
        email: "john@test.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("id");

      // cookies check
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies.length).toBeGreaterThan(0);
    });
  });

  describe("User does not exist", () => {
    it("should return 400", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "notfound@test.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("Wrong password", () => {
    it("should return 400", async () => {
      await request(app).post("/auth/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        password: "password123",
      });

      const response = await request(app).post("/auth/login").send({
        email: "john@test.com",
        password: "wrongpassword",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("Validation errors", () => {
    it("should return validation error", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "",
        password: "",
      });

      expect(response.statusCode).toBe(400);
    });
  });
});