import {Application, json, urlencoded, Request, Response, NextFunction} from 'express'
import * as http from 'http';
import cookieSession from 'cookie-session';
import compression from 'compression';
import cors from 'cors'
import hpp from 'hpp';
import helmet from "helmet";
import { config } from "./config";

import { Server } from 'socket.io';

import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

import applicationRoutes from './routes';
import HTTP_STATUS from "http-status-codes";
import {CustomError, IErrorResponse} from "./shared/globals/helpers/error-handler";

import Logger from 'bunyan';


const SERVER_PORT = process.env.PORT || 8000;
const log: Logger = config.createLogger('server')

export class ChattyServer {
    private app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public start(): void {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routes(this.app);
        this.globalErrorHandling(this.app);
        this.startServer(this.app);
    }

    private securityMiddleware(app: Application): void {
        app.use(cookieSession({
            name: 'session',
            keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            secure: config.NODE_ENV !== 'development',
        }));
        app.use(hpp());
        app.use(helmet());
        app.use(cors({
                origin: config.CLIENT_URL,
                credentials: true,
                optionsSuccessStatus: 200,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            }
        ));
    }

    private standardMiddleware(app: Application): void {
        app.use(compression());
        app.use(json({limit: '50mb'})); //limit the size of the request body
        app.use(urlencoded({limit: '50mb', extended: true}));
    }

    private routes(app: Application): void {
        applicationRoutes(app);
    }

    private globalErrorHandling(app: Application): void {
        log.error()
        app.all('*', (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({message: `${req.originalUrl} not found`});
        })

        app.use((err: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
          console.log(err);
          if (err instanceof CustomError) {
              return res.status(err.statusCode).json(err.serializeErrors());
          }
        })
    }

    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer: http.Server = new http.Server(app);
            const socketIO: Server = await this.createSocketIo(httpServer);
            this.socketIOConnections(socketIO);
            this.startHttpServer(httpServer);
        } catch (error) {
            log.error(error);
        }
    }

    private async createSocketIo(httpServer: http.Server): Promise<Server> {
        //create a new socket.io server
        const io: Server = new Server(httpServer, {
            cors: {
                origin: config.CLIENT_URL,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            }
        });

        //create a new redis client
        const pubClient = createClient({url: config.REDIS_HOST});
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()])
        // @ts-ignore
        io.adapter(createAdapter(pubClient, subClient));

        return io;

    }

    private startHttpServer(httpServer: http.Server): void {
        log.info(`Starting server with process ${process.pid}`);
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Server is running on port ${SERVER_PORT}`);
        })
    }

    private socketIOConnections(io: Server): void {}
}