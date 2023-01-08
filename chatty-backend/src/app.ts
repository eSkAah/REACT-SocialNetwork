import express, {Express, Request, Response} from 'express';
import {ChattyServer} from './setupServer';
import databaseConnect from './setupDatabase';
import {config} from "./config";

export class Application {
    public init(): void {
        this.loadConfig();
        databaseConnect();
        const app: Express = express();
        const server: ChattyServer = new ChattyServer(app);
        server.start();
    }

    private loadConfig(): void {
        config.validateConfig();
    }
}

const app: Application = new Application();
app.init();