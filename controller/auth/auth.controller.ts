import { Request, Response } from "express";
import { getUserByUsernameOrEmail, signupDal } from "../../dal/auth.dal";
import { user } from "@prisma/client";
import genrateResponse from "../../lib/generateResponse";
import HttpStatus from "../../lib/httpStatus";
import { z } from 'zod';
import validation from "../../lib/vallidation";
import crypto from 'crypto';
import jwt from 'jsonwebtoken'


const hashPassword = (password: string): string => {
    const hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
};

const comparePasswords = (inputPassword: string, storedHash: string): boolean => {
    const inputHash = hashPassword(inputPassword);
    return inputHash === storedHash;
};

const generateToken = (user: Omit<user, 'password' | 'createdAt' | 'updatedAt'> & { password?: string }): string => {
    if (user?.password) {
        delete user.password
    }
    const payload: Omit<user, 'password' | 'createdAt' | 'updatedAt'> = user;
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '24h' });
};

export const verifyToken = (token: string): Omit<user, 'password' | 'createdAt' | 'updatedAt'> | null => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string) as Omit<user, 'password' | 'createdAt' | 'updatedAt'>;
    } catch (err) {
        console.error(err)
        return null;
    }
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

export const login = async (req: Request, res: Response) => {

    try {
        const { usernameOrEmail, password }: { usernameOrEmail: string, password: string } = req.body
        const user = await getUserByUsernameOrEmail(usernameOrEmail)
        if (!user) {
            throw { message: 'Username or Email is invalid', status: HttpStatus.Unauthorized }
        }
        const isMatch: boolean = comparePasswords(password, user?.password)
        if (isMatch) {
            const token: string = generateToken(user)
            genrateResponse(
                res,
                HttpStatus.OK,
                'User logged in successfully',
                token
            )
        } else {
            throw { message: 'Invalid password', status: HttpStatus.Unauthorized }
        }
    } catch (err: any) {
        console.error(`[${new Date().toISOString()}]`, err)
        genrateResponse(
            res,
            err?.status || HttpStatus.BadRequest,
            err?.message as string
        )
    }
}