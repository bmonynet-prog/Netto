import slugify from 'slugify';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return categories;
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw ApiError.notFound('Category not found');
  return category;
}

export async function createCategory(input: { name: string; description?: string }) {
  const existing = await prisma.category.findUnique({ where: { name: input.name } });
  if (existing) throw ApiError.conflict('A category with this name already exists');

  const slug = await generateUniqueSlug(input.name);
  return prisma.category.create({ data: { name: input.name, slug, description: input.description } });
}

export async function updateCategory(id: string, input: { name?: string; description?: string }) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Category not found');

  const data: { name?: string; description?: string; slug?: string } = { ...input };
  if (input.name && input.name !== existing.name) {
    data.slug = await generateUniqueSlug(input.name, id);
  }

  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Category not found');

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw ApiError.conflict('Cannot delete category that has products assigned. Reassign or remove products first.');
  }

  await prisma.category.delete({ where: { id } });
  return { message: 'Category deleted successfully' };
}
