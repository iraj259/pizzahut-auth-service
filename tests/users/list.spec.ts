import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from "@jest/globals";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/contants";

describe("GET /user", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    const JWKS_URL = "http://localhost:5555";

    beforeAll(async () => {
        jwks = createJWKSMock(JWKS_URL);
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        if (connection?.isInitialized) {
            await connection.destroy();
        }
    });

    const createAdminToken = () =>
        jwks.token({
            sub: "admin-user",
            role: Roles.ADMIN,
        });

    const createCustomerToken = () =>
        jwks.token({
            sub: "customer-user",
            role: Roles.CUSTOMER,
        });

    it("should return 200 for admin", async () => {
        const token = createAdminToken();

        const res = await request(app)
            .get("/user")
            .set("Cookie", [`accessToken=${token}`]);

        expect(res.statusCode).toBe(200);
    });

    it("should return paginated users list", async () => {
        const userRepository = connection.getRepository(User);

        await userRepository.save({
            firstName: "test",
            lastName: "user",
            email: "test@example.com",
            password: "password123",
            role: Roles.CUSTOMER,
        });

        const token = createAdminToken();

        const res = await request(app)
            .get("/user")
            .set("Cookie", [`accessToken=${token}`]);

        expect(Array.isArray(res.body.data)).toBe(true);
        expect((res.body.data as User[]).length).toBeGreaterThan(0);
        expect(res.body).toHaveProperty("currentPage");
        expect(res.body).toHaveProperty("perPage");
        expect(res.body).toHaveProperty("total");
    });

    it("should NOT expose password field", async () => {
        const userRepository = connection.getRepository(User);

        await userRepository.save({
            firstName: "test",
            lastName: "user",
            email: "test@example.com",
            password: "password123",
            role: Roles.CUSTOMER,
        });

        const token = createAdminToken();

        const res = await request(app)
            .get("/user")
            .set("Cookie", [`accessToken=${token}`]);

        for (const user of res.body.data as User[]) {
            expect(user).not.toHaveProperty("password");
        }
    });

    it("should return 403 for non-admin", async () => {
        const token = createCustomerToken();

        const res = await request(app)
            .get("/user")
            .set("Cookie", [`accessToken=${token}`]);

        expect(res.statusCode).toBe(403);
    });

    it("should return 401 when no token provided", async () => {
        const res = await request(app).get("/user");

        expect(res.statusCode).toBe(401);
    });
});