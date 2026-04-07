import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto, UpdateBlogPostDto, CreateBlogCategoryDto, UpdateBlogCategoryDto } from './dto/blog.dto';
import { PaginationDto } from '../common/dto';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublished(query: PaginationDto, categoryId?: string) {
    const where: any = { status: 'PUBLISHED', deletedAt: null };
    if (categoryId) where.categoryId = categoryId;
    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true, title: true, slug: true, excerpt: true, coverImage: true,
          categoryId: true, publishedAt: true, seoTitle: true, seoDescription: true,
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20, totalPages: Math.ceil(total / (query.pageSize || 20)) };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, status: 'PUBLISHED', deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async findRelated(slug: string, limit = 3) {
    const post = await this.prisma.blogPost.findFirst({ where: { slug, deletedAt: null } });
    if (!post) return [];
    const where: any = { status: 'PUBLISHED', deletedAt: null, id: { not: post.id } };
    if (post.categoryId) where.categoryId = post.categoryId;
    return this.prisma.blogPost.findMany({
      where,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true, category: { select: { name: true, slug: true } } },
    });
  }

  async create(authorId: string, dto: CreateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug already in use');

    const status = dto.status || (dto.published ? 'PUBLISHED' : 'DRAFT');
    return this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        content: dto.content,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        categoryId: dto.categoryId,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        authorId,
        status: status as any,
        publishedAt: status === 'PUBLISHED' ? new Date() : (dto.scheduledAt ? new Date(dto.scheduledAt) : null),
      },
    });
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.seoTitle !== undefined) data.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) data.seoDescription = dto.seoDescription;
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'PUBLISHED' && post.status !== 'PUBLISHED') {
        data.publishedAt = new Date();
      }
    } else if (dto.published !== undefined) {
      data.status = dto.published ? 'PUBLISHED' : 'DRAFT';
      if (dto.published && post.status !== 'PUBLISHED') {
        data.publishedAt = new Date();
      }
    }
    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.blogPost.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async adminFindAll(query: PaginationDto) {
    const where = { deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, email: true } },
          category: { select: { id: true, name: true } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20, totalPages: Math.ceil(total / (query.pageSize || 20)) };
  }

  // ── Category CRUD ───────────────────────────────────────────────────

  async findAllCategories() {
    return this.prisma.blogCategory.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createCategory(dto: CreateBlogCategoryDto) {
    const existing = await this.prisma.blogCategory.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Category slug already in use');
    return this.prisma.blogCategory.create({ data: { name: dto.name, slug: dto.slug, sortOrder: dto.sortOrder ?? 0 } });
  }

  async updateCategory(id: string, dto: UpdateBlogCategoryDto) {
    const cat = await this.prisma.blogCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.prisma.blogCategory.update({ where: { id }, data: dto });
  }

  async removeCategory(id: string) {
    return this.prisma.blogCategory.delete({ where: { id } });
  }

  // ── Public helpers ──────────────────────────────────────────────────

  async getAllSlugs() {
    const posts = await this.prisma.blogPost.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      select: { slug: true, updatedAt: true },
    });
    return posts;
  }
}
