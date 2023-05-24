
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.secretHash;

exports.userAuth = async (req, res, next) => {

    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    try {
        const decoded = await jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

}

exports.userAuthOptional = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return next();
    }

    try {
        const decoded = await jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        return next();
    }
}