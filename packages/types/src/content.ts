import type { BlogPostStatus } from './enums';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  authorId: string;
  categoryId: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: BlogPostStatus;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  isConfirmed: boolean;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  source: string | null;
  createdAt: string;
}
