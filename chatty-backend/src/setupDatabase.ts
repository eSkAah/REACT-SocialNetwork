import mongoose from "mongoose"
import {config} from "@root/config";
import Logger from "bunyan";

const log: Logger = config.createLogger('setupDatabase');

export default () => {
    const connect = () => {
        mongoose.connect(`${config.DATABASE_URL}`)
            .then(() => {
                log.info("Successfully connected to MongoDB");
            })
            .catch((error) => {
                log.error("Error connecting to MongoDB", error);
                return process.exit(1); // Exit the current process with an error code
            });
    };
        connect();

        mongoose.connection.on('disconnected', connect);
    }
