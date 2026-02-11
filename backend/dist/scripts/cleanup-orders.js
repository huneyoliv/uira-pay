"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    console.log('Cleaning up PENDING orders...');
    try {
        const result = await prisma.order.deleteMany({
            where: {
                status: 'PENDING',
            },
        });
        console.log(`Deleted ${result.count} PENDING orders.`);
    }
    catch (error) {
        console.error('Error cleaning up orders:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=cleanup-orders.js.map