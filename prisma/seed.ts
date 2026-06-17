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
    console.log("🚀 Seeding users...");

    const passwordHash = await bcrypt.hash("password123", 10);

    const users = [
        {
            firstName: "Prince",
            lastName: "Vishwakarma",
            email: "prince@example.com",
            password: passwordHash,
        },
    ];

    const result = await prisma.user.createMany({
        data: users,
        skipDuplicates: true,
    });

    console.log(`✅ Successfully created ${result.count} users`);

    console.log(`
=================================
Login Credentials
=================================
Email: prince@example.com
Password: password123

Email: john@example.com
Password: password123

Email: jane@example.com
Password: password123
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
