import app from "./app";
import { AppDataSource } from "./config/data-source";
import { Config } from "./config/index";
import logger from "./config/logger";

const startServer=async()=>{
    const PORT = Config.PORT
    try {
        await AppDataSource.initialize()
        logger.info("Database connected successfully")
        app.listen(PORT,()=>{
            logger.info(`port up on`, {port:PORT});   
        })
    } catch (error) {
        console.error('error connecting to server', error);
        process.exit(1)
    }
}

startServer()