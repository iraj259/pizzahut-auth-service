import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/contants";
import { isJWT } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

describe("POST/auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  // clean db before each test
  beforeEach(async () => {
    // db truncate
    await connection.dropDatabase();
    await connection.synchronize();
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
        password: "secret123",
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
      password: "secret123",
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
      password: "secret123",
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
      password: "secret123",
    };

    const response = await request(app).post("/auth/register").send(userData);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id"); // check ID exists
    expect(typeof response.body.id).toBe("number"); // check type
  });
  it("should assign a customer role", async () => {
    // arrange
    const userData = {
      firstName: "iraj",
      lastName: "M",
      email: "irajj.259@gmail.com",
      password: "secret123",
    };
    // act
    await request(app).post("/auth/register").send(userData);
    //   assert
    const userRepository = connection.getRepository(User);
    const users = await userRepository.find();
    expect(users[0]).toHaveProperty("role");
    expect(users[0].role).toBe(Roles.CUSTOMER);
  });
  it("should store the hashed password in the database", async () => {
    // arrange
    const userData = {
      firstName: "iraj",
      lastName: "M",
      email: "irajj.259@gmail.com",
      password: "secret123",
    };
    // act
    await request(app).post("/auth/register").send(userData);
    // assert
    const userRepository = connection.getRepository(User);
    const users = await userRepository.find({select:["password"]});
    expect(users[0].password).not.toBe(userData.password);
    expect(users[0].password).toHaveLength(60);
    expect(users[0].password).toMatch(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/);
  });
  it("should return 400 status code if email alr exists", async () => {
    // arrange
    const userData = {
      firstName: "iraj",
      lastName: "M",
      email: "irajj.259@gmail.com",
      password: "secret123",
    };
    const userRepository = connection.getRepository(User);
    await userRepository.save({ ...userData, role: Roles.CUSTOMER });
    // act
    const response = await request(app).post("/auth/register").send(userData);

    const users = await userRepository.find();
    // assert
    expect(response.statusCode).toBe(400);
    expect(users).toHaveLength(1);
  });

  it("should return the access token and refresh token inside a cookie", async () => {
  // arrange
  const userData = {
    firstName: "iraj",
    lastName: "M",
    email: "irajj.259@gmail.com",
    password: "secret123",
  };

  // act
  const response = await request(app).post("/auth/register").send(userData);

  interface Headers {
    ["set-cookie"]: string[];
  }

  // assert
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

const cookies = (response.headers as unknown as Headers)['set-cookie'] || []
  cookies.forEach((cookie) => {
    if (cookie.startsWith("accessToken=")) {
      accessToken = cookie.split(";")[0].split("=")[1];
    }
  });

  cookies.forEach((cookie) => {
    if (cookie.startsWith("refreshToken=")) {
      refreshToken = cookie.split(";")[0].split("=")[1];
    }
  });

  expect(accessToken).not.toBeNull();
  expect(refreshToken).not.toBeNull();
  expect(isJWT(accessToken)).toBeTruthy()
  expect(isJWT(refreshToken)).toBeTruthy()

});

  describe("fields missing", () => {
    it("should return 400 status code if email is missing", async () => {
      // arrange
      const userData = {
        firstName: "iraj",
        lastName: "M",
        email: "",
        password: "secret",
      };
      // act
      const response = await request(app).post("/auth/register").send(userData);
      // assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      //  assert
      expect(users).toHaveLength(0);

      // Validate the error message
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: "Email is required" }),
        ]),
      );
    });
    it("should return 400 status code if firstName is missing", async () => {
      // arrange
      const userData = {
        firstName: "",
        lastName: "M",
        email: "irajj.259@gmail.com",
        password: "secret",
      };
      // act
      const response = await request(app).post("/auth/register").send(userData);
      // assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it("should return 400 status code if lasttName is missing", async () => {
      // arrange
      const userData = {
        firstName: "Iraj",
        lastName: "",
        email: "irajj.259@gmail.com",
        password: "secret",
      };
      // act
      const response = await request(app).post("/auth/register").send(userData);
      // assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it("should return 400 status code if password is missing", async () => {
      // arrange
      const userData = {
        firstName: "Iraj",
        lastName: "M",
        email: "irajj.259@gmail.com",
        password: "",
      };
      // act
      const response = await request(app).post("/auth/register").send(userData);
      // assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it("should store the refresh token in the db", async ()=>{
      // arrange
      const userData = {
        firstName: "Iraj",
        lastName: "M",
        email: "irajj.259@gmail.com",
        password: "secret123",
      };
      // act
      const response = await request(app).post("/auth/register").send(userData);
      // assert
      const refreshTokenRepo = connection.getRepository(RefreshToken)
      // const refreshTokens = await refreshTokenRepo.find()
      // expect(refreshTokens).toHaveLength(1)

      const token = await refreshTokenRepo.createQueryBuilder("refreshToken").where("refreshToken.userId=:userId", {userId:response.body.id}).getMany()
      expect(token).toHaveLength(1)

    })
  });

  describe("Fields are not in proper format", () => {
    it("should trim the email field", async () => {
      // arrange
      const userData = {
        firstName: "iraj",
        lastName: "M",
        email: " irajj.259@gmail.com ",
        password: "secret123",
      };
      // act
      await request(app).post("/auth/register").send(userData);
      // assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      const user = users[0];

      expect(user.email).toBe("irajj.259@gmail.com");
    });
    it("should return 400 status code if email is not a valid format", async () => {
      const userData = {
        firstName: "Iraj",
        lastName: "M",
        email: "not-an-email",
        password: "secret123",
      };

      const response = await request(app).post("/auth/register").send(userData);

      expect(response.statusCode).toBe(400);

      // Make sure no user is created
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);

      // Optional: check error message from validator
      expect(response.body.errors[0].msg).toBe("Invalid email format");
    });
    it("should return 400 status code if password length is less than 8 chars", async () => {
      const userData = {
        firstName: "Iraj",
        lastName: "M",
        email: "irajj.259@gmail.com",
        password: "secret",
      };

      const response = await request(app).post("/auth/register").send(userData);

      expect(response.statusCode).toBe(400);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);

      // Optional: check error message
      expect(response.body.errors[0].msg).toBe(
        "Password must be at least 8 characters long",
      );
    });
    // it.todo("should return an error of messages if email is missing")
  });
});
