import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';
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
        select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, categoryId: true, publishedAt: true, author: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } } },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, status: 'PUBLISHED', deletedAt: null },
      include: { author: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } } },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async create(authorId: string, dto: CreateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug already in use');

    return this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        content: dto.content,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        authorId,
        status: dto.published ? 'PUBLISHED' : 'DRAFT',
        publishedAt: dto.published ? new Date() : null,
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
    if (dto.published !== undefined) {
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
        include: { author: { select: { id: true, email: true } } },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }
}
