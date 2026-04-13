import { DataSource } from "typeorm";
import { User } from "../src/entity/User";
import { Tenant } from "../src/entity/Tenant";
import { RefreshToken } from "../src/entity/RefreshToken";

const AppDataSource = new DataSource({
    type: "sqlite",
    database: ":memory:",
    synchronize: true,
    logging: false,
    entities: [User, Tenant, RefreshToken],
});

async function testRegistration() {
    await AppDataSource.initialize();
    
    // Create a tenant
    const tenantRepo = AppDataSource.getRepository(Tenant);
    const tenant = await tenantRepo.save({ name: "Test Tenant", address: "Test Address" });
    console.log("Created Tenant:", tenant);
    
    // Create a user via the same logic as UserService
    const userRepo = AppDataSource.getRepository(User);
    const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "hashedpassword",
        role: "customer",
        tenant: { id: tenant.id }
    };
    
    const user = await userRepo.save(userData);
    console.log("Created User:", user);
    
    const savedUser = await userRepo.findOne({ where: { id: user.id }, relations: ["tenant"] });
    console.log("Saved User with Tenant:", savedUser);
    
    if (savedUser?.tenant?.id === tenant.id) {
        console.log("SUCCESS: Tenant association works!");
    } else {
        console.error("FAILURE: Tenant association NOT working!");
    }
    
    await AppDataSource.destroy();
}

testRegistration();
