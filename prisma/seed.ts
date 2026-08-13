import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🚀 Seeding super admin...");

    const plainPassword = "123456";
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const superAdmin = await prisma.user.upsert({
        where: { email: "prince@example.com" },
        update: {},
        create: {
            firstName: "Prince",
            lastName: "Vishwakarma",
            email: "prince@example.com",
            password: passwordHash,
            role: "SUPER_ADMIN",
        },
    });

    console.log(`✅ Super admin ready: ${superAdmin.email} (id: ${superAdmin.id})`);

    console.log(`
=================================
 Super Admin Login Credentials
=================================
 Email:    prince@example.com
 Password: ${plainPassword}
 Role:     SUPER_ADMIN
=================================
`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
    .catch(async (e) => {
        console.error("❌ SEEDING ERROR:", e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });
