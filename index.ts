
// Server setup
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


// Websocket setup
import WebSocket from 'ws';
import { authByCookie } from './middleware/auth';

const wss = new WebSocket.Server({ server });

let connectedClients = new Map<string, WebSocket>();

wss.on('connection', async (ws: WebSocket, request) => {
    
    const jwtCookie = request.headers.cookie?.split(';').find((cookie: string) => cookie.trim().startsWith('jwt='))?.split('=')[1];
    
    if (!jwtCookie) {
        ws.send("Unauthorized");
        ws.close();
        return;
    }
    
    const user = authByCookie(jwtCookie);
    console.log(`User ${user.username} (${user.id}) connected`);

    connectedClients.set(user.username, ws);

    ws.on('close', () => {
        console.log(`User ${user.username} (${user.id}) disconnected`);
        connectedClients.delete(user.username);
    })
});
export { connectedClients };

// Error handling
process.on("unhandledRejection", (err: Error) => {
    console.log(`An error occurred: ${err.message}`);
    server.close(() => process.exit(1));
});

