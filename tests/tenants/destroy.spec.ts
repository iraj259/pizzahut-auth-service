import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { Tenant } from "../../src/entity/Tenant";
import { Roles } from "../../src/contants";

describe("DELETE /tenant/:id", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5555");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();

        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
            jwks.stop();
        }
    });

    describe("Given all fields", () => {
        it("should return a 200 status code and delete the tenant", async () => {
            const tenantData = { name: "Tenant name", address: "Tenant address" };
            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save(tenantData);

            const response = await request(app)
                .delete(`/tenant/${tenant.id}`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(response.statusCode).toBe(200);
            
            // Verify deletion in database
            const deletedTenant = await tenantRepository.findOneBy({ id: tenant.id });
            expect(deletedTenant).toBeNull();
        });

        it("should return a 400 error if id is not a number", async () => {
            const response = await request(app)
                .delete(`/tenant/invalid-id`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(response.statusCode).toBe(400);
        });

        it("should return 401 if user is not authenticated", async () => {
            const response = await request(app).delete(`/tenant/1`);
            expect(response.statusCode).toBe(401);
        });

        it("should return 403 if user is not an admin", async () => {
            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            const tenantData = { name: "Tenant name", address: "Tenant address" };
            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save(tenantData);

            const response = await request(app)
               .delete(`/tenant/${tenant.id}`)
               .set("Cookie", [`accessToken=${managerToken}`]);

            expect(response.statusCode).toBe(403);
            
            // Verify it was NOT deleted
            const notDeletedTenant = await tenantRepository.findOneBy({ id: tenant.id });
            expect(notDeletedTenant).not.toBeNull();
        });
    });
});
