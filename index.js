require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Connect to MongoDB
const connectDB = require('./db');
connectDB();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api', require('./routes'));

const server = app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});

// Mongoose connection error handling
process.on("unhandledRejection", (err) => {
    console.log(`An error occurred: ${err.message}`);
    server.close(() => process.exit(1));
});