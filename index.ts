import { config as configDotenv } from 'dotenv';
configDotenv();

import express from 'express';

const app = express();
app.use(express.json());

import cookieParser from 'cookie-parser';
app.use(cookieParser());

// Connect to MongoDB
import connectDB from './db';
connectDB();

import routes from './routes';
app.use('/', routes);

const server = app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});

import WebSocket from 'ws';

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
    console.log("A new client connected");

    ws.send("Hello from the server");

    ws.on('message', (message: string) => {
        console.log("New ws message: " + message);
    });
});

process.on("unhandledRejection", (err: Error) => {
    console.log(`An error occurred: ${err.message}`);
    server.close(() => process.exit(1));
});