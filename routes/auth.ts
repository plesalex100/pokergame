import User from "../models/user";

// current path: /api/auth
import { Router, Request, Response } from "express";
const router = Router();

import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";

// node
// require("crypto").randomBytes(35).toString("hex")

if (!process.env.secretHash) {
    throw new Error(`JWT Secret not found (process.env.secretHash)\nTo get a random hash run: \x1b[33mnode -e "console.log(require('crypto').randomBytes(35).toString('hex'))"\x1b[0m`);
}
const jwtSecret = process.env.secretHash;

router.get("/username", async (req: Request, res: Response) => {
    const username = req.query.name;

    if (!username) {
        return res.status(400).json({
            success: false
        });
    }

    try {
        const accountExists = await User.countDocuments({ username }, { limit: 1 }) > 0;
        res.status(200).json({
            success: true,
            available: !accountExists
        });
    } catch (err) {
        res.status(400).json({
            success: false
        });
    }
})

router.post("/register", async (req: Request, res: Response) => {
    const { username, password, confirmPassword, email } = req.body;

    if (!username || !password || !confirmPassword || !email) {
        return res.status(400).json({
            success: false,
            message: "Completeaza toate campurile"
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Parolele nu se potrivesc"
        });
    }

    if (password.length < 4) {
        return res.status(400).json({
            success: false,
            message: "Parola trebuie sa aiba minim 4 caractere"
        });
    }
    const hashedPass = await hash(password, 10);
    try {

        const alreadyExistUser = await User.countDocuments({ or: [ {username}, {email} ] }, { limit: 1 }) > 0;
        if (alreadyExistUser) {
            return res.status(400).json({
                success: false,
                message: "Utilizatorul exista deja (email sau username)",
            });
        }

        const user = await User.create({
            username,
            password: hashedPass,
            email
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
            message: "Ai creeat cu succes un cont nou",
            user,
        });
    } catch (err: any) {
        res.status(401).json({
            success: false,
            message: `Eroare: ${err._message}`
        })
    }
})

router.post("/login", async (req: Request, res: Response) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    try {
        const user = await User.findOne({ username });

        // Teoretic daca utilizatorul ar folosii in parametrii normali aplicatia, nu are cum sa ajunga aici
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Utilizator inexistent"
            })
        }

        const passCheck = await compare(password, user.password);

        if (!passCheck) {
            return res.status(401).json({
                success: false,
                message: "Parolă incorecta",
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
            success: true,
            message: "Login successful",
            user
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: `Eroare: ${error._message}`
        })
    }
})

import { userAuth, RequestWithUser } from "../middleware/auth";

// status
router.get("/", userAuth, async (req: RequestWithUser, res: Response) => {
    try {
        const user = await User.findById(req.user?.id, null, {
            projection: {
                username: 1,
                coins: 1
            }
        });
        res.status(200).json({
            success: true,
            user,
        })
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: "An error occurred",
            error: error.message,
        })
    }
});

// log out
router.delete("/", (_req: Request, res: Response) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
});

export default router;