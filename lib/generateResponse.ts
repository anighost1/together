import { Response } from "express"
import HttpStatus from "./httpStatus"

const generateResponse = (res: Response, status: HttpStatus, message: string, data?: any, extra: any = {}) => {
    res.status(status).json({
        message: message,
        data: data,
        ...extra
    })
}

export default generateResponse