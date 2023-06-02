import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const jwtSecret: jwt.Secret = process.env?.secretHash || "secret";

interface LoggedUser {
    id: string;
    username: string;
}

interface RequestWithUser extends Request {
    user?: LoggedUser;
}

const userAuth = async (req: RequestWithUser, res: Response, next: NextFunction) => {

    const token: string = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as LoggedUser;
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
}

const userAuthOptional = async (req: RequestWithUser, _res: Response, next: NextFunction) => {
    const token: string = req.cookies.jwt;
    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as LoggedUser;
        req.user = decoded;
        next();
    } catch (err) {
        return next();
    }
}

export { userAuth, userAuthOptional, RequestWithUser };