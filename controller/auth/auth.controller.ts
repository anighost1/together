import { Request, Response } from "express";
import { signupDal } from "../../dal/auth.dal";
import { user } from "@prisma/client";
import genrateResponse from "../../lib/generateResponse";
import HttpStatus from "../../lib/httpStatus";
import { z } from 'zod';
import validation from "../../lib/vallidation";
import crypto from 'crypto';


const hashPassword = (password: string): string => {
    const hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
};


export const signup = async (req: Request, res: Response) => {

    const validationSchema = z.object({
        name: z.string().min(2).max(50),
        username: z.string().min(3).max(20),
        email: z.string().email(),
        password: z.string().min(8),
    });

    try {
        const { name, username, email, password } = req.body
        const dataToSend: Omit<user, 'id' | 'createdAt' | 'updatedAt'> = {
            name,
            username,
            email,
            password
        }
        validation(dataToSend, validationSchema)
        dataToSend.password = hashPassword(dataToSend?.password)
        const user = await signupDal(dataToSend)
        genrateResponse(
            res,
            HttpStatus.OK,
            'User created successfully',
            user
        )
    } catch (err: any) {
        console.error(`[${new Date().toISOString()}]`, err)
        genrateResponse(
            res,
            err?.status || HttpStatus.BadRequest,
            err?.message as string
        )
    }
}