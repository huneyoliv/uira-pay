import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    console.log('Cleaning up PENDING orders...');

    try {
        const result = await prisma.order.deleteMany({
            where: {
                status: 'PENDING',
            },
        });
        console.log(`Deleted ${result.count} PENDING orders.`);
    } catch (error) {
        console.error('Error cleaning up orders:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
