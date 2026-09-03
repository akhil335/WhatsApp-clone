import jwt from "jsonwebtoken"

export const generateToken = (userId: string) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not set in environment variables");
    }

    return jwt.sign({ userId }, jwtSecret, {
        expiresIn: "1y",
    });
}