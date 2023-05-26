require('dotenv').config();
const express = require('express');


const app = express();
app.use(express.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Connect to MongoDB
const connectDB = require('./db');
connectDB();

app.use('/', require('./routes'));

const server = app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});

process.on("unhandledRejection", (err) => {
    console.log(`An error occurred: ${err.message}`);
    server.close(() => process.exit(1));
});