import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const newAdminId = "user_396iQi00c34rKL9I1wQc8JNv6G5";
    const oldAdminId = "admin1";

    // Check if target admin already exists to avoid unique constraint error on re-run
    const existing = await prisma.admin.findUnique({
        where: { id: newAdminId },
    });

    if (existing) {
        console.log(`Admin with ID ${newAdminId} already exists.`);
        return;
    }

    // Check if old admin exists
    const oldAdmin = await prisma.admin.findUnique({
        where: { id: oldAdminId },
    });

    if (oldAdmin) {
        await prisma.admin.update({
            where: { id: oldAdminId },
            data: { id: newAdminId },
        });
        console.log(`Updated admin ID from ${oldAdminId} to ${newAdminId}`);
    } else {
        // If admin1 doesn't exist (maybe already renamed?), create new
        await prisma.admin.create({
            data: {
                id: newAdminId,
                username: "admin_clerk_user",
            },
        });
        console.log(`Created new admin with ID ${newAdminId}`);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
