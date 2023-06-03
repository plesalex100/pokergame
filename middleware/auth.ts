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
        req.user = authByCookie(token);
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
        req.user = authByCookie(token);
        next();
    } catch (err) {
        return next();
    }
}

const authByCookie = (token: string) => {
    return jwt.verify(token, jwtSecret) as LoggedUser;
}

export { userAuth, userAuthOptional, RequestWithUser, authByCookie };