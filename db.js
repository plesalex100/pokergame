const Mongoose = require("mongoose");

const connectDB = async () => {

    if (!process.env.mongouri) {
        throw new Error("MongoDB URI not found (process.env.mongouri)");
    }
    if (!process.env.mongodatabase) {
        console.warn("\x1b[33mWarning: MongoDB Database not found (process.env.mongodatabase)\nUsing default database 'test'\x1b[0m");
    }

    const { connection } = await Mongoose.connect(process.env.mongouri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.mongodatabase,
    });
    console.log(`MongoDB Connected to Database ${connection.db.databaseName}`);
}

module.exports = connectDB;