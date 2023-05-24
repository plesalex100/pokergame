require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Connect to MongoDB
const connectDB = require('./db');
connectDB();

const { userAuthOptional } = require('./middleware/auth');

app.get('/', userAuthOptional, (req, res) => {

    if (!req.user) {
        return res.send("TODO Login & Register page");
    }

    res.json(req.user);
})

app.use('/', require('./routes'));



const server = app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});

// Mongoose connection error handling
process.on("unhandledRejection", (err) => {
    console.log(`An error occurred: ${err.message}`);
    server.close(() => process.exit(1));
});