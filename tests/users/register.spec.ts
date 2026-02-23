import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/contants";
describe("POST/auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  // clean db before each test
  beforeEach(async () => {
    // db truncate
    await connection.dropDatabase()
    await connection.synchronize()
  });

  // after db connection
  afterAll(async () => {
    await connection.destroy();
  });

  describe("given all fields", () => {
    it("should return the 201 status code", async () => {
      // arrange
      const userData = {
        firstName: "iraj",
        lastName: "M",
        email: "irajj.259@gmail.com",
        password: "secret",
      };
      // act
      const response = await request(app).post("/auth/register").send(userData);
      // assert
      expect(response.statusCode).toBe(201);
    });
  });
  it("should return valid json response", async () => {
    // arrange
    const userData = {
      firstName: "iraj",
      lastName: "M",
      email: "irajj.259@gmail.com",
      password: "secret",
    };
    // act
    const response = await request(app).post("/auth/register").send(userData);
    // assert
    expect(
      (response.headers as Record<string, string>)["content-type"],
    ).toEqual(expect.stringContaining("json"));
  });
  it("should persist the user in the db", async () => {
    // arrange
    const userData = {
      firstName: "iraj",
      lastName: "M",
      email: "irajj.259@gmail.com",
      password: "secret",
    };
    // act
    await request(app).post("/auth/register").send(userData);
    //   assert
    const userRepository = connection.getRepository(User);
    const users = await userRepository.find();
    expect(users).toHaveLength(1);
    // expect(users[0].firstName).toBe(userData.firstName);
    // expect(users[0].lastName).toBe(userData.lastName);
    // expect(users[0].email).toBe(userData.email);
    // expect(users[0].password).toBe(userData.password);
  });
it("should return an id of the created user", async () => {
  const userData = {
    firstName: "iraj",
    lastName: "M",
    email: "irajj.259@gmail.com",
    password: "secret",
  };

  const response = await request(app).post("/auth/register").send(userData);

  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty("id");       // check ID exists
  expect(typeof response.body.id).toBe("number");   // check type
});
it("should assign a customer role", async()=>{
   // arrange
      const userData = {
        firstName: "iraj",
        lastName: "M",
        email: "irajj.259@gmail.com",
        password: "secret",
      };
      // act
      await request(app).post("/auth/register").send(userData);
         //   assert
    const userRepository = connection.getRepository(User);
    const users = await userRepository.find();
    expect(users[0]).toHaveProperty('role')
    expect(users[0].role).toBe(Roles.CUSTOMER);
})
it("should store the hashed password in the database", async()=>{
  // arrange
      const userData = {
        firstName: "iraj",
        lastName: "M",
        email: "irajj.259@gmail.com",
        password: "secret",
      };
      // act
      await request(app).post("/auth/register").send(userData);
      // assert
    const userRepository = connection.getRepository(User);
    const users = await userRepository.find();
    expect(users[0].password).not.toBe(userData.password)
    expect(users[0].password).toHaveLength(60)
    expect(users[0].password).toMatch(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/);
})
it("should return 400 status code if email alr exists", async()=>{
  // arrange
      const userData = {
        firstName: "iraj",
        lastName: "M",
        email: "irajj.259@gmail.com",
        password: "secret",
      };
      const userRepository = connection.getRepository(User)
      await userRepository.save({...userData, role:Roles.CUSTOMER})
      // act
     const response = await request(app).post("/auth/register").send(userData);
     
     const users = await userRepository.find()
      // assert
      expect(response.statusCode).toBe(400)
      expect(users).toHaveLength(1)
})

describe("fields missing", () => {});
});
