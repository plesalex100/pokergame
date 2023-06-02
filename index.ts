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

process.on("unhandledRejection", (err: Error) => {
    console.log(`An error occurred: ${err.message}`);
    server.close(() => process.exit(1));
});