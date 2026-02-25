import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";

describe("POST /auth/login", () => {
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



      describe("Given all fields", () => {
        it.todo("it should login the user")
      })
})