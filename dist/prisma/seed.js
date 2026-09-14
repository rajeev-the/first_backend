"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const catalog_data_1 = require("../src/modules/categories/catalog.data");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log(`Seeding ${catalog_data_1.ALL_50_CATEGORIES.length} service categories & problems...`);
    let categoriesCreated = 0;
    let problemsCreated = 0;
    for (const cat of catalog_data_1.ALL_50_CATEGORIES) {
        const category = await prisma.serviceCategory.upsert({
            where: { slug: cat.slug },
            update: {
                name: cat.name,
                icon: cat.icon,
                filter: cat.filter,
                description: cat.description,
                isActive: true,
            },
            create: {
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon,
                filter: cat.filter,
                description: cat.description,
                isActive: true,
            },
        });
        categoriesCreated++;
        for (const prob of cat.problems) {
            const existing = await prisma.problemType.findFirst({
                where: { categoryId: category.id, title: prob.title },
            });
            if (!existing) {
                await prisma.problemType.create({
                    data: {
                        categoryId: category.id,
                        title: prob.title,
                        description: prob.description,
                        estimatedPriceMin: new client_1.Prisma.Decimal(prob.minPrice),
                        estimatedPriceMax: new client_1.Prisma.Decimal(prob.maxPrice),
                        isActive: true,
                    },
                });
                problemsCreated++;
            }
        }
    }
    console.log(`✅ Seeding completed: ${categoriesCreated} categories and ${problemsCreated} problem types ready.`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map