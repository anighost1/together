import { Request, Response, NextFunction } from "express"
import { verifyToken } from "../controller/auth/auth.controller"
import generateResponse from "../lib/generateResponse"
import HttpStatus from "../lib/httpStatus"

type customReq = Request & {
    user?: any
}

const userMiddleware = (req: customReq, res: Response, next: NextFunction) => {
    const token = req?.headers?.authorization?.split(' ')[1]
    if (token) {
        const decodedToken = verifyToken(token)
        if (decodedToken) {
            req.user = decodedToken
        } else {
            generateResponse(
                res,
                HttpStatus.BadRequest,
                'Invalid token provided'
            )
        }
    } else {
        generateResponse(
            res,
            HttpStatus.BadRequest,
            'No token provided'
        )
    }
    next()
}

export default userMiddleware