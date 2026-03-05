"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const data_source_1 = require("./config/data-source");
const index_1 = require("./config/index");
const logger_1 = __importDefault(require("./config/logger"));
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    const PORT = index_1.Config.PORT;
    try {
        yield data_source_1.AppDataSource.initialize();
        logger_1.default.info("Database connected successfully");
        app_1.default.listen(PORT, () => {
            logger_1.default.info(`port up on`, { port: PORT });
        });
    }
    catch (error) {
        console.error('error connecting to server', error);
        process.exit(1);
    }
});
startServer();
