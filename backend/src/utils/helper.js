
import { cookieOptions } from "../config/config.js";
import jsonwebtoken from "jsonwebtoken"

export const generateShortUrl = (length = 6) => {
    return Math.random().toString(36).slice(2, 2 + length)
}

export const signToken = (payload) => {
    return jsonwebtoken.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" })
}

export const verifyToken = (token) => {

    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET)
    console.log(decoded.id)
    return decoded.id
}