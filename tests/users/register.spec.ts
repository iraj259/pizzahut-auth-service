import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/contants";
import { isJWT } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";
import { Tenant } from "../../src/entity/Tenant";

describe("POST/auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    describe("given all fields", () => {
        it("should return the 201 status code", async () => {
            const userData = {
                firstName: "iraj",
                lastName: "M",
                email: "irajj.259@gmail.com",
                password: "secret123",
            };
            const response = await request(app).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(201);
        });

        it("should return valid json response", async () => {
            const userData = {
                firstName: "iraj",
                lastName: "M",
                email: "irajj.259@gmail.com",
                password: "secret123",
            };
            const response = await request(app).post("/auth/register").send(userData);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
        });

        it("should persist the user in the db", async () => {
            const userData = {
                firstName: "iraj",
                lastName: "M",
                email: "irajj.259@gmail.com",
                password: "secret123",
            };
            await request(app).post("/auth/register").send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
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
            expect(response.body).toHaveProperty("id");
            expect(typeof response.body.id).toBe("number");
        });

        it("should assign a customer role", async () => {
            const userData = {
                firstName: "iraj",
                lastName: "M",
                email: "irajj.259@gmail.com",
                password: "secret123",
            };
            await request(app).post("/auth/register").send(userData);
            const userRepository = connection.getRepository(User);
            const user = await userRepository.findOneBy({ email: userData.email });
            expect(user?.role).toBe(Roles.CUSTOMER);
        });

        it("should store the hashed password in the database", async () => {
            const userData = {
                firstName: "iraj",
                lastName: "M",
                email: "irajj.259@gmail.com",
                password: "secret123",
            };
            await request(app).post("/auth/register").send(userData);
            const userRepository = connection.getRepository(User);
            const user = await userRepository.findOne({
                where: { email: userData.email },
                select: ["password"]
            });
            expect(user?.password).not.toBe(userData.password);
            expect(user?.password).toHaveLength(60);
        });

        it("should return 400 status code if email already exists", async () => {
            const userData = {
                firstName: "iraj",
                lastName: "M",
                email: "irajj.259@gmail.com",
                password: "secret123",
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });
            const response = await request(app).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(400);
        });

        it("should return the access token and refresh token inside a cookie", async () => {
            const userData = {
                firstName: "iraj",
                lastName: "M",
                email: "irajj.259@gmail.com",
                password: "secret123",
            };
            const response = await request(app).post("/auth/register").send(userData);

            let accessToken: string | null = null;
            let refreshToken: string | null = null;

            const cookies = (response.headers["set-cookie"] as unknown as string[]) || [];
            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJWT(accessToken!)).toBeTruthy();
            expect(isJWT(refreshToken!)).toBeTruthy();
        });
    });

    describe("fields missing", () => {
        it("should return 400 status code if email is missing", async () => {
            const userData = { firstName: "iraj", lastName: "M", email: "", password: "secret123" };
            const response = await request(app).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(400);
            expect(response.body.errors).toEqual(
                expect.arrayContaining([expect.objectContaining({ msg: "Email is required" })])
            );
        });

        it("should return 400 status code if firstName is missing", async () => {
            const userData = { firstName: "", lastName: "M", email: "irajj@e.com", password: "secret123" };
            const response = await request(app).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(400);
        });

        it("should store the refresh token in the db", async () => {
            const userData = {
                firstName: "Iraj",
                lastName: "M",
                email: "irajj.259@gmail.com",
                password: "secret123",
            };
            const response = await request(app).post("/auth/register").send(userData);
            const refreshTokenRepo = connection.getRepository(RefreshToken);
            const token = await refreshTokenRepo.findOneBy({ user: { id: response.body.id } });
            expect(token).not.toBeNull();
        });
    });

    describe("Fields are not in proper format", () => {
        it("should trim the email field", async () => {
            const userData = {
                firstName: "iraj",
                lastName: "M",
                email: " irajj.259@gmail.com ",
                password: "secret123",
            };
            await request(app).post("/auth/register").send(userData);
            const userRepository = connection.getRepository(User);
            const user = await userRepository.findOneBy({ firstName: "iraj" });
            expect(user?.email).toBe("irajj.259@gmail.com");
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
        });
    });

    describe("Tenant association", () => {
        it("should associate the user with the provided tenantId", async () => {
            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save({
                name: "Test Tenant",
                address: "Test Address",
            });

            const userData = {
                firstName: "Iraj",
                lastName: "M",
                email: "irajj.259@gmail.com",
                password: "secret123",
                tenantId: tenant.id,
            };

            await request(app).post("/auth/register").send(userData);

            const userRepository = connection.getRepository(User);
            const user = await userRepository.findOne({
                where: { email: userData.email },
                relations: ["tenant"]
            });

            expect(user?.tenant?.id).toBe(tenant.id);
        });
    });
});
