import fs from "node:fs";
import path from "node:path";
import * as dotenv from "dotenv";

jest.mock("dotenv", () => ({
    config: jest.fn()
}));

describe("Config", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        jest.resetModules();
        originalEnv = { ...process.env };
        (dotenv.config as jest.Mock).mockClear();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("should load private key from PRIVATE_KEY_PATH if it exists", () => {
        const tempKeyPath = path.join(__dirname, "temp_private.pem");
        const testKeyContent = "test-private-key-content";
        fs.writeFileSync(tempKeyPath, testKeyContent);

        process.env.PRIVATE_KEY_PATH = tempKeyPath;
        process.env.REFRESH_TOKEN_SECRET = "test-secret";

        const { Config } = require("../../src/config/index");

        expect(Config.PRIVATE_KEY).toBe(testKeyContent);

        fs.unlinkSync(tempKeyPath);
    });

    it("should fallback to ENV_PRIVATE_KEY if PRIVATE_KEY_PATH does not exist", () => {
        process.env.PRIVATE_KEY_PATH = "non_existent_file.pem";
        process.env.PRIVATE_KEY = "env-fallback-key";
        process.env.REFRESH_TOKEN_SECRET = "test-secret";

        const { Config } = require("../../src/config/index");

        expect(Config.PRIVATE_KEY).toBe("env-fallback-key");
    });

    it("should throw error if REFRESH_TOKEN_SECRET is missing", () => {
        // Ensure it's empty
        process.env.REFRESH_TOKEN_SECRET = "";

        expect(() => {
            require("../../src/config/index");
        }).toThrow("REFRESH_TOKEN_SECRET is missing");
    });

    it("should throw error if PRIVATE_KEY_PATH exists but cannot be read", () => {
        const tempDirPath = path.join(__dirname, "temp_dir");
        if (!fs.existsSync(tempDirPath)) fs.mkdirSync(tempDirPath);

        process.env.PRIVATE_KEY_PATH = tempDirPath;
        process.env.REFRESH_TOKEN_SECRET = "test-secret";

        expect(() => {
            require("../../src/config/index");
        }).toThrow();

        fs.rmdirSync(tempDirPath);
    });
});
