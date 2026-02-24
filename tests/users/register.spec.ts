import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/contants";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("given all valid fields", () => {
    const validUser = {
      firstName: "Iraj",
      lastName: "M",
      email: "irajj.259@gmail.com",
      password: "secret123", // ✅ 8+ chars
    };

    it("should return 201 status code", async () => {
      const response = await request(app).post("/auth/register").send(validUser);
      expect(response.statusCode).toBe(201);
    });

    it("should return JSON response", async () => {
      const response = await request(app).post("/auth/register").send(validUser);
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });

    it("should persist the user in the database", async () => {
      await request(app).post("/auth/register").send(validUser);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
    });

    it("should return an id of the created user", async () => {
      const response = await request(app).post("/auth/register").send(validUser);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(typeof response.body.id).toBe("number");
    });

    it("should assign a customer role", async () => {
      await request(app).post("/auth/register").send(validUser);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    it("should store hashed password", async () => {
      await request(app).post("/auth/register").send(validUser);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0].password).not.toBe(validUser.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/);
    });
  });

  describe("when fields are missing", () => {
    const baseUser = {
      firstName: "Iraj",
      lastName: "M",
      email: "irajj.259@gmail.com",
      password: "secret123",
    };

    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ ...baseUser, email: "" });

      expect(response.statusCode).toBe(400);
      const users = await connection.getRepository(User).find();
      expect(users).toHaveLength(0);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: "Email is required" }),
        ])
      );
    });

    it("should return 400 if firstName is missing", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ ...baseUser, firstName: "" });
      expect(response.statusCode).toBe(400);
      const users = await connection.getRepository(User).find();
      expect(users).toHaveLength(0);
    });

    it("should return 400 if lastName is missing", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ ...baseUser, lastName: "" });
      expect(response.statusCode).toBe(400);
      const users = await connection.getRepository(User).find();
      expect(users).toHaveLength(0);
    });

    it("should return 400 if password is missing", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ ...baseUser, password: "" });
      expect(response.statusCode).toBe(400);
      const users = await connection.getRepository(User).find();
      expect(users).toHaveLength(0);
    });
  });

  describe("when fields are in wrong format", () => {
    const baseUser = {
      firstName: "Iraj",
      lastName: "M",
      password: "secret123",
    };

    it("should trim email", async () => {
      const userData = { ...baseUser, email: " irajj.259@gmail.com " };
      await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0].email).toBe("irajj.259@gmail.com");
    });

    it("should return 400 if email is invalid", async () => {
      const userData = { ...baseUser, email: "not-an-email" };
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(400);
      const users = await connection.getRepository(User).find();
      expect(users).toHaveLength(0);
      expect(response.body.errors[0].msg).toBe("Invalid email format");
    });

    it("should return 400 if password < 8 chars", async () => {
      const userData = { ...baseUser, email: "test@test.com", password: "short" };
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(400);
      const users = await connection.getRepository(User).find();
      expect(users).toHaveLength(0);
      expect(response.body.errors[0].msg).toBe(
        "Password must be at least 8 characters long"
      );
    });
  });

  it("should return 400 if email already exists", async () => {
    const userData = {
      firstName: "Iraj",
      lastName: "M",
      email: "irajj.259@gmail.com",
      password: "secret123",
    };
    const userRepository = connection.getRepository(User);
    await userRepository.save({ ...userData, role: Roles.CUSTOMER });
    const response = await request(app).post("/auth/register").send(userData);
    expect(response.statusCode).toBe(400);
    const users = await userRepository.find();
    expect(users).toHaveLength(1);
  });
});