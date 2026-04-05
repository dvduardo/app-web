import { prisma } from "@/server/db/prisma";

function normalizeCategoryName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export async function findUserCategoryByName(userId: string, name: string) {
  const normalizedName = normalizeCategoryName(name);
  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true },
  });

  return (
    categories.find(
      (category) => category.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase()
    ) ?? null
  );
}

export async function getOrCreateCategoryByName(userId: string, name: string) {
  const normalizedName = normalizeCategoryName(name);
  const existingCategory = await findUserCategoryByName(userId, normalizedName);
  if (existingCategory) {
    return existingCategory;
  }

  return prisma.category.create({
    data: {
      userId,
      name: normalizedName,
    },
    select: {
      id: true,
      name: true,
    },
  });
}
