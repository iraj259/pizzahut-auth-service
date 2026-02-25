import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from 'mock-jwks'
import { User } from "../../src/entity/User";
import { Roles } from "../../src/contants";
describe("GET /auth/self", () => {
  let connection: DataSource;
  let jwks:ReturnType<typeof createJWKSMock>

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5555')
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start()
    await connection.dropDatabase();
    await connection.synchronize();
  });
  
  afterEach(() => {
    jwks.stop()
  })

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
   it("should return the 200 status code", async () => {
        const accessToken = jwks.token({sub:'1', role:Roles.CUSTOMER})


    const response = await request(app).get("/auth/self").set("Cookie", [`accessToken=${accessToken}`]).send()
    expect(response.statusCode).toBe(200)
   })

   it("should return the user data", async () => {
    // register user
     const userData = {
        firstName: "iraj",
        lastName: "M",
        email: "irajj.259@gmail.com",
        password: "secret123",
      };
    const userRepository = connection.getRepository(User)
    const data = await userRepository.save({...userData, role:Roles.CUSTOMER})
    // generate token
    const accessToken = jwks.token({sub:String(data.id), role:data.role})
    // add token to cookie
    const response = await request(app).get("/auth/self").set("Cookie", [`accessToken=${accessToken};`]).send()
    // assert
    // check if user id matched with registered user
    expect(response.body.id).toBe(data.id)
   })

   it("should not return the password field", async() => {
  // register user
     const userData = {
        firstName: "iraj",
        lastName: "M",
        email: "irajj.259@gmail.com",
        password: "secret123",
      };
    const userRepository = connection.getRepository(User)
    const data = await userRepository.save({...userData, role:Roles.CUSTOMER})
    // generate token
    const accessToken = jwks.token({sub:String(data.id), role:data.role})
    // add token to cookie
    const response = await request(app).get("/auth/self").set("Cookie", [`accessToken=${accessToken};`]).send()
    // assert
    // check if user id matched with registered user
  expect(response.body).not.toHaveProperty('password'); // <--- fixed
   })

it("should return 401 status code of token does not exist", async() => {
  // register user
     const userData = {
        firstName: "iraj",
        lastName: "M",
        email: "irajj.259@gmail.com",
        password: "secret123",
      };
    const userRepository = connection.getRepository(User)
    await userRepository.save({...userData, role:Roles.CUSTOMER})
    
    // add token to cookie
    const response = await request(app).get("/auth/self").send()
    // assert
    expect(response.statusCode).toBe(401)
   })
  
  });

 
  
});