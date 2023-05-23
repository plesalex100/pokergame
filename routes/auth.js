const User = require("../models/user");
const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// node
// require("crypto").randomBytes(35).toString("hex")

if (!process.env.secretHash) {
    throw new Error(`JWT Secret not found (process.env.secretHash)\nTo get a random hash run: \x1b[33mnode -e "console.log(require('crypto').randomBytes(35).toString('hex'))"\x1b[0m`);
}
const jwtSecret = process.env.secretHash;

router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password required"
        });
    }

    if (password.length < 4) {
        return res.status(400).json({
            success: false,
            message: `Password less than 4 characters`
        });
    }
    const hashedPass = await bcrypt.hash(password, 10);
    try {

        const alreadyExistUser = await User.countDocuments({ username }, { limit: 1 }) > 0;
        if (alreadyExistUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const user = await User.create({
            username,
            password: hashedPass
        });

        const maxAge = 3 * 60 * 60;
        const token = jwt.sign(
            { id: user._id, username },
            jwtSecret,
            { expiresIn: maxAge } // sec
        );
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000, // ms
        });

        res.status(200).json({
            success: true,
            message: "User successfully created",
            user,
        });
    } catch (err) {
        res.status(401).json({
            success: false,
            message: "User not successful created",
            error: err.mesage,
        })
    }
})

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    try {
        const user = await User.findOne({ username });

        const passCheck = await bcrypt.compare(password, user.password);

        if (!passCheck) {
            return res.status(401).json({
                message: "Login not successful",
                error: "Password does not match",
            })
        }

        if (!user) {
            return res.status(401).json({
                message: "Login not successful",
                error: "User not found",
            })
        }

        const maxAge = 3 * 60 * 60;
        const token = jwt.sign(
            { id: user._id, username },
            jwtSecret,
            { expiresIn: maxAge } // sec
        );
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000, // ms
        });

        res.status(200).json({
            message: "Login successful",
            user,
        })
    } catch (error) {
        res.status(400).json({
            message: "An error occurred",
            error: error.message,
        })
    }
})

const { userAuth } = require("../middleware/auth");

router.get("/status", userAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id, null, {
            projection: {
                username: 1,
                coins: 1
            }
        });
        res.status(200).json({
            success: true,
            user,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "An error occurred",
            error: error.message,
        })
    }
});

router.get("/logout", (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
});

module.exports = router;