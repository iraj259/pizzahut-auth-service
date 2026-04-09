import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from 'mock-jwks'
import { User } from "../../src/entity/User";
import { Roles } from "../../src/contants";

describe("GET /user", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>

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
        it("should return the 200 status code for Admins", async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN })
            const response = await request(app).get("/user").set("Cookie", [`accessToken=${accessToken}`]).send()
            expect(response.statusCode).toBe(200)
        })

        it("should return the list of users", async () => {
             // register user
             const userData = {
                firstName: "test",
                lastName: "user",
                email: "test@example.com",
                password: "password123",
            };
            const userRepository = connection.getRepository(User)
            await userRepository.save({ ...userData, role: Roles.CUSTOMER })
            
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN })
            const response = await request(app).get("/user").set("Cookie", [`accessToken=${accessToken}`]).send()
            
            expect(response.body.data).toBeInstanceOf(Array)
            expect(response.body.data.length).toBeGreaterThan(0)
            expect(response.body).toHaveProperty('currentPage')
            expect(response.body).toHaveProperty('perPage')
            expect(response.body).toHaveProperty('total')
        })

        it("should not return the password field in the user list", async () => {
             // register user
             const userData = {
                firstName: "test",
                lastName: "user",
                email: "test@example.com",
                password: "password123",
            };
            const userRepository = connection.getRepository(User)
            await userRepository.save({ ...userData, role: Roles.CUSTOMER })
            
            const accessToken = jwks.token({ sub: '1', role: Roles.ADMIN })
            const response = await request(app).get("/user").set("Cookie", [`accessToken=${accessToken}`]).send()
            
            response.body.data.forEach((user: User) => {
                expect(user).not.toHaveProperty('password')
            })
        })

        it("should return 403 status code for non-admin users", async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.CUSTOMER })
            const response = await request(app).get("/user").set("Cookie", [`accessToken=${accessToken}`]).send()
            expect(response.statusCode).toBe(403)
        })

        it("should return 401 status code if token does not exist", async () => {
            const response = await request(app).get("/user").send()
            expect(response.statusCode).toBe(401)
        })
    });
});
