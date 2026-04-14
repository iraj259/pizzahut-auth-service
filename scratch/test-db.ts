import { AppDataSource } from "../src/config/data-source";

async function testConn() {
    try {
        console.log("Connecting...");
        await AppDataSource.initialize();
        console.log("Connected!");
        await AppDataSource.destroy();
        console.log("Disconnected!");
    } catch (err) {
        console.error("Connection failed:", err);
    }
}

testConn();
