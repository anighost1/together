import { PrismaClient, user } from "@prisma/client";

const prisma = new PrismaClient()

export const signupDal = async (signupData: Omit<user, 'id' | 'createdAt' | 'updatedAt'>): Promise<Omit<user, 'password' | 'createdAt' | 'updatedAt'>> => {
    return await prisma.user.create({
        data: signupData,
        select: {
            id: true,
            name: true,
            username: true,
            email: true
        }
    })
}