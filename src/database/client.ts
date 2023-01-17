import { PrismaClient } from "@prisma/client"

declare global {
    // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const Prisma = async () => {
    try {
        const prisma = new PrismaClient()
        await prisma.$connect();
        global.prisma = prisma;
        console.log("Database connected")
    } catch (e) {
        console.log("Could not connect to Database")
    }
}

const prisma = global.prisma || new PrismaClient();

export default prisma;