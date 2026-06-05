import "dotenv/config"; // Important: Prisma 7 doesn't load .env automatically in scripts
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma";

// 1. Setup the connection pool using your environment variable
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });

// 2. Initialize the Prisma Driver Adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter to the PrismaClient constructor
const prisma = new PrismaClient({ adapter });

// ------------------------ Model -> Testing ---------------------
// async function main() {
//   console.log("🚀 Seeding started...");

//   const result = await prisma.model.createMany({
//     data: [
//       { name: "John Doe", email: "john@example.com" },
//       { name: "Jane Smith", email: "jane@example.com" },
//       { name: "Bob Johnson", email: "bob@example.com" },
//     ],
//     skipDuplicates: true,
//   });

//   console.log(`✅ Successfully created ${result.count} rows`);
// }

// ------------------------ Clients ---------------------
// async function main() {
//     console.log("🚀 Seeding 24 clients...");

//     // Generate the data array automatically
//     const clientData = Array.from({ length: 24 }, (_, i) => {
//         const idNumber = (i + 1).toString().padStart(2, "0"); // Result: "01", "02", etc.
//         return {
//             name: `Client ${idNumber}`,
//             image: `/images/our-clients/${idNumber}.png`,
//             description: `Premium partner since 2026`, // Optional: add a placeholder
//         };
//     });

//     const result = await prisma.clients.createMany({
//         data: clientData,
//         skipDuplicates: true,
//     });

//     console.log(`✅ Successfully created ${result.count} client rows`);
// }

// ------------------------ Project Category ---------------------
// async function main() {
//     console.log("🚀 Seeding started...");

//     const result = await prisma.projectCategory.createMany({
//         data: [
//             { name: "Activation", description: "Interactive activations designed to connect brands with people through memorable and impactful experiences." },
//             { name: "Corporate Events", description: "From conferences to company celebrations, we deliver seamless corporate events tailored to your business goals." },
//             { name: "Experiential", description: "Creative experiential events that inspire interaction, storytelling, and meaningful audience engagement." },
//             { name: "Live Events", description: "Dynamic live events produced with creativity and flawless execution to captivate every audience." },
//         ],
//         skipDuplicates: true,
//     });

//     console.log(`✅ Successfully created ${result.count} rows`);
// }

// ------------------------ Project ---------------------
async function main() {
    console.log("🚀 Seeding started...");

    const result = await prisma.project.createMany({
        data: [
            {
                title: "Sharjah brand launch",
                description: "Interactive activations designed to connect brands with people through memorable and impactful experiences.",
                bannerImage: "/images/projects/experiental/project-1.png",
                images: ["/images/projects/experiental/project-1.png", "/images/projects/experiental/project-1.png"],
                categoryId: 3,
            },
            {
                title: "Ramdaan Street Food Festival",
                description: "Interactive activations designed to connect brands with people through memorable and impactful experiences.",
                bannerImage: "/images/projects/live-events/project-2.png",
                images: ["/images/projects/live-events/project-2.png", "/images/projects/live-events/project-2.png"],
                categoryId: 4,
            },
            {
                title: "Ramdaan Street Food Festival",
                description: "Interactive activations designed to connect brands with people through memorable and impactful experiences.",
                bannerImage: "/images/projects/experiental/project-3.png",
                images: ["/images/projects/experiental/project-3.png", "/images/projects/experiental/project-3.png"],
                categoryId: 3,
            },
            {
                title: "Ramdaan Street Food Festival",
                description: "Interactive activations designed to connect brands with people through memorable and impactful experiences.",
                bannerImage: "/images/projects/experiental/project-4.png",
                images: ["/images/projects/experiental/project-4.png", "/images/projects/experiental/project-4.png"],
                categoryId: 3,
            },
            {
                title: "Ramdaan Street Food Festival",
                description: "Interactive activations designed to connect brands with people through memorable and impactful experiences.",
                bannerImage: "/images/projects/corporate-events/project-1.png",
                images: ["/images/projects/corporate-events/project-1.png", "/images/projects/corporate-events/project-1.png"],
                categoryId: 2,
            },
            {
                title: "Ramdaan Street Food Festival",
                description: "Interactive activations designed to connect brands with people through memorable and impactful experiences.",
                bannerImage: "/images/projects/experiental/project-5.png",
                images: ["/images/projects/experiental/project-5.png", "/images/projects/experiental/project-5.png"],
                categoryId: 3,
            },
            {
                title: "MOE - Staff gathering",
                description: "Interactive activations designed to connect brands with people through memorable and impactful experiences.",
                bannerImage: "/images/projects/corporate-events/project-2.png",
                images: ["/images/projects/corporate-events/project-2.png", "/images/projects/corporate-events/project-2.png"],
                categoryId: 2,
            },
            {
                title: "Ramdaan Street Food Festival",
                description: "Interactive activations designed to connect brands with people through memorable and impactful experiences.",
                bannerImage: "/images/projects/experiental/project-6.png",
                images: ["/images/projects/experiental/project-6.png", "/images/projects/experiental/project-6.png"],
                categoryId: 3,
            },
        ],
        skipDuplicates: true,
    });

    console.log(`✅ Successfully created ${result.count} rows`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end(); // Close the pool connection
    })
    .catch(async (e) => {
        console.error("❌ SEEDING ERROR:", e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });
