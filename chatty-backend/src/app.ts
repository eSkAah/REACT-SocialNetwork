import express, {Express, Request, Response} from 'express';
import {ChattyServer} from '@root/setupServer';
import databaseConnect from '@root/setupDatabase';
import {config} from "@root/config";

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
        config.cloudinaryConfig();
    }
}

const app: Application = new Application();
app.init();