import app from "./app";
import { Config } from "./config/index";
import logger from "./config/logger";

const startServer=()=>{
    const PORT = Config.PORT
    try {
        app.listen(PORT,()=>{
            logger.info(`port up on`, {port:PORT});   
        })
    } catch (error) {
        console.error('error connecting to server', error);
        process.exit(1)
    }
}

startServer()